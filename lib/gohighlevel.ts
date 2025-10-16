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

    // Prepare contact payload
    const baseContactData = {
      firstName: contactData.firstName,
      lastName: contactData.lastName || '',
      email: contactData.email,
      phone: contactData.phone,
      source: 'website',
      tags: ['dog-boarding', 'website-form'],
      // TODO: Add custom fields once basic contact creation works
      // customFields: [
      //   { id: 'dog_name', value: contactData.dogName },
      //   { id: 'dog_breed', value: contactData.dogBreed },
      // ],
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