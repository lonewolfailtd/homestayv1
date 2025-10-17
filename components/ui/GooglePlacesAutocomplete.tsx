'use client';

import { useEffect, useRef, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, addressComponents?: {
    city?: string;
    postalCode?: string;
    country?: string;
  }) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter your address",
  className = "",
  disabled = false
}: GooglePlacesAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useNewElement, setUseNewElement] = useState(true);

  useEffect(() => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!API_KEY) {
      console.warn('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      setError('Google Maps API key not configured');
      return;
    }

    // Load Google Maps API
    const loadGoogleMaps = async () => {
      if (!(window as any).google?.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&region=NZ&version=weekly`;
        script.async = true;
        script.defer = true;
        
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    };

    loadGoogleMaps()
      .then(() => {
          if (containerRef.current && !autocompleteRef.current) {
            try {
            // Try new PlaceAutocompleteElement for new customers
            if (useNewElement && (window as any).google?.maps?.places?.PlaceAutocompleteElement) {
              const autocompleteElement = new (window as any).google.maps.places.PlaceAutocompleteElement();
              
              autocompleteElement.componentRestrictions = { country: 'nz' };
              autocompleteElement.types = ['address'];
              autocompleteElement.placeholder = placeholder;
              
              // Style the new element to match our design
              autocompleteElement.style.width = '100%';
              autocompleteElement.style.height = '48px';
              autocompleteElement.style.borderRadius = '8px';
              autocompleteElement.style.border = '1px solid #d1d5db';
              autocompleteElement.style.padding = '12px 16px';
              autocompleteElement.style.fontSize = '16px';
              
              autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
                const place = event.place;
                if (place && place.formattedAddress) {
                  onChange(place.formattedAddress);
                  
                  // Extract address components for new API
                  const addressComponents = {
                    city: '',
                    postalCode: '',
                    country: '',
                  };

                  if (place.addressComponents) {
                    place.addressComponents.forEach((component: any) => {
                      const types = component.types;
                      
                      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                        addressComponents.city = component.longText;
                      } else if (types.includes('postal_code')) {
                        addressComponents.postalCode = component.longText;
                      } else if (types.includes('country')) {
                        addressComponents.country = component.longText;
                      }
                    });
                  }

                  onChange(place.formattedAddress, addressComponents);
                  
                  if (onPlaceSelect) {
                    // Convert new API format to legacy format for compatibility
                    const legacyPlace = {
                      formatted_address: place.formattedAddress,
                      place_id: place.id,
                      address_components: place.addressComponents?.map((comp: any) => ({
                        long_name: comp.longText,
                        short_name: comp.shortText,
                        types: comp.types
                      })),
                      geometry: place.location ? {
                        location: place.location
                      } : undefined
                    } as any;
                    onPlaceSelect(legacyPlace);
                  }
                }
              });
              
              containerRef.current.appendChild(autocompleteElement);
              autocompleteRef.current = autocompleteElement;
              setIsLoaded(true);
              
            } else {
              // Fallback to legacy Autocomplete for existing customers
              throw new Error('New element not available, trying legacy');
            }
          } catch (newElementError) {
            console.log('New PlaceAutocompleteElement not available, falling back to legacy Autocomplete');
            setUseNewElement(false);
            
            // Fallback to legacy implementation
            try {
              // Create a regular input for legacy autocomplete
              const input = document.createElement('input');
              input.type = 'text';
              input.placeholder = placeholder;
              input.value = value;
              input.className = className;
              input.disabled = disabled;
              
              containerRef.current.appendChild(input);
              
              const legacyAutocomplete = new (window as any).google.maps.places.Autocomplete(
                input,
                {
                  componentRestrictions: { country: 'nz' },
                  fields: [
                    'address_components',
                    'formatted_address',
                    'geometry',
                    'name',
                    'place_id',
                  ],
                  types: ['address'],
                }
              );

              legacyAutocomplete.addListener('place_changed', () => {
                const place = legacyAutocomplete.getPlace();
                if (place && place.formatted_address) {
                  onChange(place.formatted_address);
                  
                  const addressComponents = {
                    city: '',
                    postalCode: '',
                    country: '',
                  };

                  if (place.address_components) {
                    place.address_components.forEach((component: any) => {
                      const types = component.types;
                      
                      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                        addressComponents.city = component.long_name;
                      } else if (types.includes('postal_code')) {
                        addressComponents.postalCode = component.long_name;
                      } else if (types.includes('country')) {
                        addressComponents.country = component.long_name;
                      }
                    });
                  }

                  onChange(place.formatted_address, addressComponents);
                  
                  if (onPlaceSelect) {
                    onPlaceSelect(place);
                  }
                }
              });

              // Handle manual input changes
              input.addEventListener('input', (e) => {
                onChange((e.target as HTMLInputElement).value);
              });

              autocompleteRef.current = legacyAutocomplete;
              setIsLoaded(true);
              
            } catch (legacyError) {
              console.error('Both new and legacy autocomplete failed:', legacyError);
              setError('Failed to load Google Maps autocomplete');
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps');
      });

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        if (useNewElement) {
          // Cleanup new element
          autocompleteRef.current.remove?.();
        } else {
          // Cleanup legacy element
          (window as any).google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
        }
      }
    };
  }, [onChange, onPlaceSelect, placeholder, className, disabled, value, useNewElement]);

  // Fallback to regular input if Google Maps fails to load
  if (error) {
    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
        <p className="text-xs text-amber-600 mt-1">
          Address autocomplete unavailable. Please enter your address manually.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="w-full">
        {/* Autocomplete element will be inserted here */}
      </div>
      {!useNewElement && (
        <input
          type="hidden"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}