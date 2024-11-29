import {fetchUserCommunities} from '../main/communities.mjs';
import {fetchCommunities} from '../main/communities.mjs';

const email = localStorage.getItem('userEmail');
const token = localStorage.getItem('token');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownArrow = document.getElementById('dropdownArrow');



document.getElementById("logout").addEventListener("click", async (event) => {
    const response = await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    localStorage.clear();
    window.location.href = '../authorization/authorization.html'; 
})

document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = '../profile/profile.html'; 
})

if (userEmail) {
    userEmail.textContent = email || 'Вход';
} else {
    console.error('email not found in localStorage');

}
if (userEmail.textContent === email) {
    userEmail.addEventListener('click', () => {
        dropdownMenu.classList.toggle('visible');
    });
}
else{
    dropdownArrow.style.display = "none";
    userEmail.addEventListener('click', () => {
        window.location.href = '../authorization/authorization.html'; 
    });
}

async function userCommunities() {
    try {
        const userCommunities = await fetchUserCommunities(token);
        const allCommunities = await fetchCommunities();
        if (!userCommunities || !Array.isArray(userCommunities) || !Array.isArray(allCommunities)) {
            console.error('Community not found for user');
            return [];
        }
        const adminCommunities = userCommunities.filter(
            community => community.role === 'Administrator').
            map(userCommunity => {
                const matchedCommunity = allCommunities.find(
                    community => community.id === userCommunity.communityId
                );
                return {
                    id: userCommunity.communityId,
                    name: matchedCommunity ? matchedCommunity.name : 'Unknown'
                };
            });
        return adminCommunities;
        
    }
    catch (error) {
        console.error('Error verifying user role:', error.message);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const communitySelect = document.getElementById('community');

    if (!communitySelect) {
        console.error('communitySelect not found');
    } 

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Без группы';
    communitySelect.appendChild(defaultOption);
    const adminCommunities = await userCommunities();

    if (adminCommunities.length > 0) {
        adminCommunities.forEach(community => {
            const option = document.createElement('option');
            option.value = community.id;
            option.textContent = community.name;
            communitySelect.appendChild(option);

        });
    }
    else{
        console.log('no admin communities');
    }
});