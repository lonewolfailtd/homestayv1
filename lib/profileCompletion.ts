import { prisma } from '@/lib/db';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completeness: number; // 0-100
  missing: string[];
  checklist: {
    hasDogProfile: boolean;
    hasDogPhotos: boolean;
    hasVaccinationRecords: boolean;
    hasVetInfo: boolean;
    hasPersonalInfo: boolean;
  };
}

/**
 * Check if a user's profile is complete enough to make a booking
 * @param clerkUserId - The Clerk user ID
 * @returns Profile completion status with checklist
 */
export async function checkProfileCompleteness(
  clerkUserId: string
): Promise<ProfileCompletionStatus> {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    // Get customer record (has personal info)
    const customer = await prisma.customer.findFirst({
      where: {
        clerkUserId: clerkUserId,
      },
    });

    // Get dogs for this customer
    const dogs = customer
      ? await prisma.dog.findMany({
          where: { customerId: customer.id },
          include: {
            files: true,
          },
        })
      : [];

    // Check requirements - PRIORITISED ORDER
    const checklist = {
      hasDogProfile: dogs.length > 0,
      hasDogPhotos: dogs.some(
        (dog) =>
          dog.files.filter((f) => f.fileCategory === 'photo').length > 0
      ),
      hasVaccinationRecords: dogs.some(
        (dog) =>
          dog.files.filter((f) => f.fileCategory === 'vaccination').length > 0
      ),
      hasVetInfo: dogs.some((dog) => dog.vetClinic && dog.vetPhone),
      hasPersonalInfo: !!(
        customer &&
        customer.phone &&
        customer.address &&
        customer.emergencyName &&
        customer.emergencyPhone &&
        customer.emergencyRelation
      ),
    };

    // Build missing items list - IN PRIORITY ORDER
    const missing: string[] = [];
    if (!checklist.hasDogProfile) missing.push('Dog profile');
    if (!checklist.hasDogPhotos) missing.push('Dog photos');
    if (!checklist.hasVaccinationRecords) missing.push('Vaccination records');
    if (!checklist.hasVetInfo) missing.push('Vet information');
    if (!checklist.hasPersonalInfo) missing.push('Personal information');

    // Calculate completeness percentage
    const total = Object.keys(checklist).length;
    const completed = Object.values(checklist).filter(Boolean).length;
    const completeness = Math.round((completed / total) * 100);

    // Profile is complete if all requirements are met
    const isComplete = missing.length === 0;

    return {
      isComplete,
      completeness,
      missing,
      checklist,
    };
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    // Return safe defaults if error
    return {
      isComplete: false,
      completeness: 0,
      missing: ['Unable to verify profile'],
      checklist: {
        hasPersonalInfo: false,
        hasDogProfile: false,
        hasDogPhotos: false,
        hasVaccinationRecords: false,
        hasVetInfo: false,
      },
    };
  }
}

/**
 * Update user's profile completeness in the database
 * @param clerkUserId - The Clerk user ID
 */
export async function updateProfileCompleteness(clerkUserId: string) {
  try {
    const status = await checkProfileCompleteness(clerkUserId);

    await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        profileCompleteness: status.completeness,
        hasCompletedOnboarding: status.isComplete,
      },
      create: {
        clerkId: clerkUserId,
        email: '', // Will be updated by Clerk webhook
        profileCompleteness: status.completeness,
        hasCompletedOnboarding: status.isComplete,
      },
    });

    return status;
  } catch (error) {
    console.error('Error updating profile completeness:', error);
    throw error;
  }
}
