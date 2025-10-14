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
    const apiKey = process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      throw new Error('GoHighLevel API credentials not configured');
    }

    // First, try to find existing contact by email
    const searchResponse = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodeURIComponent(contactData.email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let contactId: string | null = null;
    
    if (searchResponse.ok) {
      const existingContact = await searchResponse.json();
      contactId = existingContact.contact?.id || null;
    }

    // Prepare contact payload
    const contactPayload = {
      firstName: contactData.firstName,
      lastName: contactData.lastName || '',
      email: contactData.email,
      phone: contactData.phone,
      address1: contactData.address,
      city: contactData.city,
      postalCode: contactData.postalCode,
      locationId: locationId,
      customFields: [
        { key: 'emergency_contact_name', value: contactData.emergencyName },
        { key: 'emergency_contact_phone', value: contactData.emergencyPhone },
        { key: 'emergency_relationship', value: contactData.emergencyRelation },
        { key: 'dog_name', value: contactData.dogName },
        { key: 'dog_age', value: contactData.dogAge.toString() },
        { key: 'dog_breed', value: contactData.dogBreed },
        { key: 'dog_sex', value: contactData.dogSex },
        { key: 'vaccinated', value: contactData.vaccinated },
        { key: 'neutered', value: contactData.neutered },
        { key: 'vet_clinic', value: contactData.vetClinic || '' },
        { key: 'vet_phone', value: contactData.vetPhone || '' },
        { key: 'medications', value: contactData.medications || '' },
        { key: 'medical_conditions', value: contactData.medicalConditions || '' },
        { key: 'crate_trained', value: contactData.crateTrained },
        { key: 'social_level', value: contactData.socialLevel },
        { key: 'people_behavior', value: contactData.peopleBehavior },
        { key: 'behavioral_issues', value: contactData.behavioralIssues },
        { key: 'farm_animal_reactive', value: contactData.farmAnimalReactive },
        { key: 'bite_history', value: contactData.biteHistory },
        { key: 'additional_notes', value: contactData.additionalNotes || '' },
      ],
      tags: ['dog-boarding', 'website-form'],
    };

    let response;
    let method;
    let url;

    if (contactId) {
      // Update existing contact
      method = 'PUT';
      url = `https://rest.gohighlevel.com/v1/contacts/${contactId}`;
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactPayload),
      });
    } else {
      // Create new contact
      method = 'POST';
      url = 'https://rest.gohighlevel.com/v1/contacts/';
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactPayload),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
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

    const response = await fetch('https://rest.gohighlevel.com/v1/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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