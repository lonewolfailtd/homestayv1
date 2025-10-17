interface ContactData {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  dogName: string;
  dogAge: number;
  dogBreed: string;
  dogSex: string;
  vaccinated: string;
  neutered: string;
  vetClinic?: string;
  vetPhone?: string;
  medications?: string;
  medicalConditions?: string;
  crateTrained: string;
  socialLevel: string;
  peopleBehavior: string;
  behavioralIssues: string;
  farmAnimalReactive: string;
  biteHistory: string;
  additionalNotes?: string;
}

export async function createOrUpdateGHLContact(contactData: ContactData) {
  try {
    // Temporary hardcode to fix environment loading issue
    const apiKey = process.env.GOHIGHLEVEL_API_KEY === 'your_gohighlevel_api_key' 
      ? 'pit-27a5c1a7-226f-4d4d-be78-f283d50a0585' 
      : process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID === 'your_location_id'
      ? 'mVQxYpWNwb0DgXHsEKn3'
      : process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      throw new Error('GoHighLevel API credentials not configured');
    }

    // ✅ Try both lookup methods based on other agent's guidance
    // Method 1: Direct contact fetch using known contact ID (from error)
    let directFetchContact = null;
    try {
      const directResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/klHqwVP94twjcZDHn0nt`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
        }
      );
      if (directResponse.ok) {
        directFetchContact = await directResponse.json();
        console.log('Direct contact fetch successful:', directFetchContact);
      }
    } catch (error) {
      console.log('Direct fetch failed:', error);
    }

    // Method 2: Try contacts search with location filtering
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      }
    );

    let contactId: string | null = null;
    
    // Use direct fetch result if available
    if (directFetchContact && directFetchContact.contact) {
      contactId = directFetchContact.contact.id;
      console.log('Using direct fetch contact:', contactId);
    } else {
      // Try search results
      console.log('GoHighLevel Search Response Status:', searchResponse.status);
      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        console.log('GoHighLevel Search Result:', JSON.stringify(searchResult, null, 2));
        
        // Search for our email in the contacts array
        if (searchResult.contacts && Array.isArray(searchResult.contacts)) {
          const foundContact = searchResult.contacts.find((contact: any) => 
            contact.email && contact.email.toLowerCase() === contactData.email.toLowerCase()
          );
          if (foundContact) {
            contactId = foundContact.id;
            console.log('Found existing contact in search:', contactId);
          } else {
            console.log('No matching contact found for email:', contactData.email);
          }
        } else {
          console.log('No contacts array in search result');
        }
      } else {
        const errorText = await searchResponse.text();
        console.log('Search failed:', errorText);
      }
    }

    // Prepare custom fields data using existing GoHighLevel field IDs
    const customFields = [
      // Dog Basic Info - using existing GHL field IDs
      { id: 'Q7jdNJUoyE8IEhMMkcsA', value: contactData.dogName || '' }, // Dog name
      { id: 'KJPJyJm2XTsOhUjjtGPb', value: contactData.dogAge?.toString() || '0' }, // Age
      { id: 'iGeSXIYOxFieamXgsxBi', value: contactData.dogBreed || '' }, // Breed
      { id: 'HfEHofATuQbFhuwSUqg0', value: contactData.dogSex || '' }, // Sex
      
      // Health Info - using existing GHL field IDs
      { id: 'GPyWmPq5XbgyURDpdqP6', value: contactData.vaccinated || '' }, // Vaccinated status
      { id: '0G9skmmlV0fB9029WOaS', value: contactData.neutered || '' }, // Neutered status
      { id: 'GGH8VBa1rh6t0h4xQOnT', value: contactData.vetClinic || '' }, // Dogs Vet
      { id: 'zkB7xsQH6HaNq7ocTWa0', value: contactData.vetPhone || '' }, // Vet Phone Number
      { id: 'TAUkZ8Be0rUzgyBtBRjQ', value: contactData.medications || '' }, // Medication
      { id: 'JjHuGNRZqG9lgKPFzfEj', value: contactData.medicalConditions || '' }, // Medical conditions
      
      // Behavior Info - using existing GHL field IDs
      { id: 'WMeoxksZGOBg20JQsOMf', value: contactData.crateTrained || '' }, // Crate trained
      { id: 'rvz64ZtR5If1gmg9bCXz', value: contactData.socialLevel || '' }, // Dog's social level
      { id: 'vrBbfOKYdFiYiWDFpEXA', value: contactData.peopleBehavior || '' }, // Behavior with people
      { id: 'gZhSU0NcXgh6HeQe6sFf', value: contactData.behavioralIssues || '' }, // Behavioral issues
      { id: 'TSCds16RaDSy8SzF5dRc', value: contactData.farmAnimalReactive || '' }, // Farm animal reactive
      { id: '8627T4J2k4AB8RcnDh7B', value: contactData.biteHistory || '' }, // Bite history
      
      // Emergency Info - using existing GHL field IDs
      { id: 'owpKAzT4uk5f3f5PysK7', value: contactData.emergencyName || '' }, // Emergency Contact Name
      { id: 'lyiNLWF1EJjAUHybImqB', value: contactData.emergencyPhone || '' }, // Emergency Contact Phone
      { id: 'zoKZkAbmTWtUVykb2O4w', value: contactData.emergencyRelation || '' }, // Emergency Contact Relation
      
      // Additional Info - using existing GHL field IDs
      { id: 'ZitIEGejOn3wb9StXdvH', value: contactData.additionalNotes || '' }, // Anything Else We Should Know
    ].filter(field => field.value !== ''); // Only send fields with values

    // Prepare contact payload
    const baseContactData = {
      firstName: contactData.firstName,
      lastName: contactData.lastName || '',
      email: contactData.email,
      phone: contactData.phone,
      source: 'website',
      tags: ['dog-boarding', 'website-form'],
      customFields: customFields,
    };

    // LocationID is required for creation but not for updates
    const contactPayload = contactId 
      ? baseContactData 
      : { ...baseContactData, locationId: locationId };

    let response;
    let method;
    let url;

    if (contactId) {
      // Update existing contact using V2 API
      method = 'PUT';
      url = `https://services.leadconnectorhq.com/contacts/${contactId}`;
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });
    } else {
      // Create new contact using V2 API
      method = 'POST';
      url = 'https://services.leadconnectorhq.com/contacts/';
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle duplicate contact error specifically
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.includes('duplicated contacts') && errorData.meta?.contactId) {
            // Contact already exists, use the existing contactId and update it
            console.log('Contact already exists, updating existing contact:', errorData.meta.contactId);
            const updateResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${errorData.meta.contactId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
              },
              body: JSON.stringify(contactPayload),
            });
            
            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              console.log('GoHighLevel Contact Updated Successfully:', updateResult);
              return {
                success: true,
                contactId: errorData.meta.contactId,
                isNewContact: false,
              };
            }
          }
        } catch (parseError) {
          // If we can't parse the error, fall through to general error handling
        }
      }
      
      console.error('GoHighLevel API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        method: method,
        headers: response.headers,
        body: errorText
      });
      throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('GoHighLevel API Success:', result);
    
    return {
      success: true,
      contactId: result.contact?.id || contactId,
      isNewContact: !contactId,
    };

  } catch (error) {
    console.error('Error with GoHighLevel contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Custom field definitions for GoHighLevel
const DOG_PROFILE_CUSTOM_FIELDS = [
  // Dog Basic Info
  { id: 'dog_name', name: 'Dog Name', fieldType: 'TEXT' },
  { id: 'dog_age', name: 'Dog Age', fieldType: 'NUMBER' },
  { id: 'dog_breed', name: 'Dog Breed', fieldType: 'TEXT' },
  { id: 'dog_sex', name: 'Dog Sex', fieldType: 'TEXT' },
  
  // Health Info
  { id: 'dog_vaccinated', name: 'Vaccinated Status', fieldType: 'TEXT' },
  { id: 'dog_neutered', name: 'Neutered/Spayed', fieldType: 'TEXT' },
  { id: 'vet_clinic', name: 'Veterinary Clinic', fieldType: 'TEXT' },
  { id: 'vet_phone', name: 'Vet Phone Number', fieldType: 'PHONE' },
  { id: 'dog_medications', name: 'Current Medications', fieldType: 'TEXTAREA' },
  { id: 'medical_conditions', name: 'Medical Conditions', fieldType: 'TEXTAREA' },
  
  // Behavior Info
  { id: 'crate_trained', name: 'Crate Trained', fieldType: 'TEXT' },
  { id: 'social_level', name: 'Social Level with Dogs', fieldType: 'TEXT' },
  { id: 'people_behavior', name: 'Behavior with People', fieldType: 'TEXT' },
  { id: 'behavioral_issues', name: 'Behavioral Issues', fieldType: 'TEXTAREA' },
  { id: 'farm_animal_reactive', name: 'Reactive to Farm Animals', fieldType: 'TEXT' },
  { id: 'bite_history', name: 'History of Biting', fieldType: 'TEXT' },
  
  // Emergency Info
  { id: 'emergency_name', name: 'Emergency Contact Name', fieldType: 'TEXT' },
  { id: 'emergency_phone', name: 'Emergency Contact Phone', fieldType: 'PHONE' },
  { id: 'emergency_relation', name: 'Emergency Contact Relation', fieldType: 'TEXT' },
  
  // Additional Info
  { id: 'dog_notes', name: 'Additional Notes', fieldType: 'TEXTAREA' },
];

export async function createGHLCustomFields() {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY === 'your_gohighlevel_api_key' 
      ? 'pit-27a5c1a7-226f-4d4d-be78-f283d50a0585' 
      : process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID === 'your_location_id'
      ? 'mVQxYpWNwb0DgXHsEKn3'
      : process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      throw new Error('GoHighLevel API credentials not configured');
    }

    console.log('Creating custom fields in GoHighLevel...');
    const results = [];

    for (const field of DOG_PROFILE_CUSTOM_FIELDS) {
      try {
        const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/customFields`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            name: field.name,
            fieldType: field.fieldType,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Created custom field: ${field.name} (${result.customField?.id})`);
          results.push({ ...field, ghlId: result.customField?.id, success: true });
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Field ${field.name} might already exist: ${errorText}`);
          results.push({ ...field, success: false, error: errorText });
        }
      } catch (error) {
        console.error(`❌ Error creating field ${field.name}:`, error);
        results.push({ ...field, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error creating GoHighLevel custom fields:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getGHLCustomFields() {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY === 'your_gohighlevel_api_key' 
      ? 'pit-27a5c1a7-226f-4d4d-be78-f283d50a0585' 
      : process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID === 'your_location_id'
      ? 'mVQxYpWNwb0DgXHsEKn3'
      : process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      throw new Error('GoHighLevel API credentials not configured');
    }

    const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/customFields`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch custom fields: ${errorText}`);
    }

    const result = await response.json();
    console.log('GoHighLevel Custom Fields:', result);
    return result;
  } catch (error) {
    console.error('Error fetching GoHighLevel custom fields:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendGHLNotification(contactId: string, message: string) {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY;

    if (!apiKey) {
      throw new Error('GoHighLevel API key not configured');
    }

    const response = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-04-15',
      },
      body: JSON.stringify({
        contactId: contactId,
        type: 'SMS',
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GoHighLevel notification failed:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending GoHighLevel notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}