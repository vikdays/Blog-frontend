import {communityRole } from './communityRole.mjs';
export async function fetchUserCommunities(token) {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/community/my', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                'accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user communities');
        }
        return await response.json();
    }
    catch (error) {
        console.error(error.message);
    }
}

export async function fetchCommunities() {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/community', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch communities');
        }
        return await response.json();
    }
    catch (error) {
        console.error(error.message);
    }
       
}

export async function canUserLike(postComminityId, token) {
    try {
        const [userCommunities, allCommunities] = await Promise.all([
            fetchUserCommunities(token),
            fetchCommunities(),
        ]);
        const community = allCommunities.find(c => c.id === postComminityId);
        if (!community) {
            console.error('Community not found for post:, postCommunityId');
            return false;
        }
        console.log('is closed', community.isClosed, community)
        if (community.isClosed) {
            return userCommunities.some(
                (community) => 
                    community.communityId === postComminityId && (userCommunities.role === communityRole.Administrator || 
                        userCommunities.role === communityRole.Subscriber)      
            );
        }
        return true;
        
    }
    catch (error) {
        console.error('Error verifying user role:', error.message);
        return false;
    }
}