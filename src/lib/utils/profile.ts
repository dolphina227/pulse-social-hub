/**
 * Parse profile data to extract display name and username
 * Profile structure: [username, bioData, avatar, createdAt]
 * bioData can be either a plain string (legacy) or JSON: { displayName, bio }
 */
export function parseProfile(profile: any) {
  if (!profile) {
    return {
      username: '',
      displayName: '',
      bio: '',
      avatar: '',
    };
  }

  const username = profile[0] || '';
  const bioField = profile[1] || '';
  const avatar = profile[2] || '';

  let displayName = '';
  let bio = '';

  try {
    const parsed = JSON.parse(bioField);
    if (parsed.displayName !== undefined && parsed.bio !== undefined) {
      displayName = parsed.displayName;
      bio = parsed.bio;
    } else {
      bio = bioField;
    }
  } catch {
    // If not JSON, treat as plain bio
    bio = bioField;
  }

  return {
    username,
    displayName,
    bio,
    avatar,
  };
}

/**
 * Get the best display text for a user (display name > username > address)
 */
export function getDisplayText(profile: any, address: string): string {
  const { displayName, username } = parseProfile(profile);
  return displayName || username || address;
}
