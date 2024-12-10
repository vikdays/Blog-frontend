import {fetchUserCommunities} from '../main/communities.mjs';
import {fetchCommunities} from '../main/communities.mjs';
import { getAddressId } from './createAddress.js';
import '../profile/dropdownMenu.mjs';

const postId = localStorage.getItem('postId');
const token = localStorage.getItem('token');
const createButton = document.getElementById('create-btn');
const communityId = localStorage.getItem('communityId');

createButton.addEventListener("click", async (e) => {
    if (postId) {
        localStorage.removeItem('postId');
    }
    
    e.preventDefault();
    const communityId = getCommunityId();
    const post = {
        title: document.getElementById("title").value,
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value),
        readingTime: document.getElementById("readingTime").value || null,
        image: document.getElementById("image").value || null,
        description: document.getElementById("description").value || null,
        addressId: getAddressId(),   
        id: communityId,
    };
    try {
        let postId;
        if (post.id === null) {
            postId = await createNewPost(post, token);
        } else {
            postId = await createCommunityPost(post, communityId, token);
        }
        if (postId) {
            
            localStorage.setItem('postId', postId);
            window.location.href = "http://127.0.0.1:5500/postPage/postPage.html";
        }
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

async function createNewPost(post, token) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'text/plain',
            },
            body: JSON.stringify({
                title: post.title,
                description: post.description,
                readingTime: post.readingTime,
                image: post.image,
                addressId: post.addressId,
                tags: post.tags
            }),
        });

        if (!response.ok) { 
            const errorText = await response.text();
            console.error(errorText);
            if (response.status === 400) {
                alert(response.title.message );
            }
            return false;
        }
        else{
            const postIdRaw = await response.text();
            const postId = postIdRaw.replace(/['"]+/g, '');
            console.log(postId);
            return postId
        }

    } catch (error) {
        console.error("Ошибка при отправке комментария", error.message);
        return false;
    }
}

async function createCommunityPost(post, communityId, token) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/community/${communityId}/post`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'text/plain',
            },
            body: JSON.stringify({
                title: post.title,
                description: post.description,
                readingTime: post.readingTime,
                image: post.image,
                addressId: post.addressId,
                tags: post.tags
            }),
        });

        if (!response.ok) { 
            const errorText = await response.text();
            console.error(errorText);
            return false;
        }
        else{
            const postIdRaw = await response.text();
            const postId = postIdRaw.replace(/['"]+/g, '');
            console.log(postId);
            return postId
        }

    } catch (error) {
        console.error("Ошибка при отправке комментария", error.message);
        return false;
    }
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


    if (!token) {
        alert('Чтобы написать пост, необходимо авторизоваться');
        window.location.href = '../createPost/createPost.html'; 
    }
    const communitySelect = document.getElementById('community');

    if (!communitySelect) {
        console.error('communitySelect not found');
    } 
    const adminCommunities = await userCommunities();
    if (communityId) {
        adminCommunities.forEach(community => {
            if (community.id === communityId) {
                const defaultOption = document.createElement('option');
                defaultOption.value = community.id;
                defaultOption.textContent = community.name;
                communitySelect.appendChild(defaultOption);
            }
        });
    }
    else{
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Без группы';
        communitySelect.appendChild(defaultOption);
    
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
    }
    
});

function getCommunityId() {
    const communitySelect = document.getElementById('community');
    const option = communitySelect.options[communitySelect.selectedIndex];
    if (option && option.value === '') {
        return null; 
    }
    return option.value;
}

