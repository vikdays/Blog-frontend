const postId = localStorage.getItem('postId');
const token = localStorage.getItem('token');
import '../profile/dropdownMenu.mjs';
import { fetchAddress} from './address.mjs';
import { likePost, dislikePost } from '../main/post.mjs';
import { renderComments, postComment } from './comments.mjs';
import { renderCommentsChain } from './commentsChain.mjs';
import '../profile/getProfile.js';

export async function fetchPost(postId, token = null) {
    console.log(postId, token);

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response =  await fetch(`https://blog.kreosoft.space/api/post/${postId}`, { headers });

    if (!response.ok) {
        console.error("Не удалось получить данные о посте");
        return null;
    }

    const postData = await response.json();
    return postData;
}

export async function renderPost(post) {
    const postsContainer = document.querySelector(".container-posts");
    postsContainer.innerHTML = "";

    if (post) {
        console.log('post-desc', post);

        const postElement = document.createElement("div");
        postElement.classList.add("container-posts");

        if (post.addressId !== null) {
            var formattedAddress = await fetchAddress(post.addressId);
        }

        const bodyContainer = document.createElement("div");
        bodyContainer.classList.add("container-posts-body");

        const upperDiv = document.createElement("div");
        upperDiv.classList.add("upper");

        const pretitle = document.createElement("div");
        pretitle.classList.add("pretitle");
        pretitle.textContent = `${post.author} - ${new Date(post.createTime).toLocaleString()} в сообществе "${post.communityName ? post.communityName : "415"}"`;

        const title = document.createElement("h2");
        title.classList.add("post-title");
        title.dataset.id = post.id;
        title.textContent = post.title;

        upperDiv.append(pretitle, title);

        const downDiv = document.createElement("div");
        downDiv.classList.add("down");

        const imgContainer = document.createElement("div");
        imgContainer.classList.add("post-img");

        const postImg = document.createElement("img");
        postImg.id = "post-img";
        postImg.src = post.image ? post.image : " ";
        imgContainer.appendChild(postImg);

        const descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("post-description");

        const shortDescription = document.createElement("div");
        shortDescription.classList.add("short-description");
        shortDescription.textContent = post.description;

        descriptionContainer.appendChild(shortDescription);

        const tags = document.createElement("div");
        tags.classList.add("post-tags");
        tags.textContent = `#${post.tags.map(tag => tag.name).join(" #")}`;

        const readingTime = document.createElement("div");
        readingTime.classList.add("post-time");
        readingTime.textContent = `Время чтения: ${post.readingTime} мин.`;

        const geoDiv = document.createElement("div");
        geoDiv.classList.add("post-geo");

        if (formattedAddress) {
            const geoImg = document.createElement("img");
            geoImg.src = "../images/geo.png";
            geoImg.alt = "geo";
            geoImg.id = "geo";
            geoDiv.appendChild(geoImg);
        }

        if (formattedAddress) {
            const addressText = document.createElement("div");
            addressText.textContent = formattedAddress;
            geoDiv.appendChild(addressText);
        }

        downDiv.append(imgContainer, descriptionContainer, tags, readingTime, geoDiv);

        bodyContainer.append(upperDiv, downDiv);

        const footerContainer = document.createElement("div");
        footerContainer.classList.add("container-posts-footer");

        const commentsContainer = document.createElement("div");
        commentsContainer.classList.add("container-posts-comment");
        commentsContainer.id = "comments-section";

        const commentsCount = document.createElement("div");
        commentsCount.id = "comments-count";
        commentsCount.textContent = post.commentsCount;

        const commentImg = document.createElement("img");
        commentImg.src = "../images/comment.png";
        commentImg.alt = "comment";
        commentImg.id = "comment";
        commentImg.dataset.id = post.id;

        commentsContainer.append(commentsCount, commentImg);

        const likesContainer = document.createElement("div");
        likesContainer.classList.add("container-posts-likes");

        const likesCount = document.createElement("div");
        likesCount.id = "likes-count";
        likesCount.textContent = post.likes;

        const likeButton = document.createElement("button");
        likeButton.classList.add("image-button");
        likeButton.dataset.id = post.id;
        likeButton.dataset.communityId = post.communityId;

        const likeImg = document.createElement("img");
        likeImg.id = "like";
        likeImg.classList.add("like-img");
        likeImg.src = post.hasLike ? "../images/love.png" : "../images/heart.png";
        likeImg.alt = post.hasLike ? "love" : "heart";

        likeButton.appendChild(likeImg);
        likesContainer.append(likesCount, likeButton);

        footerContainer.append(commentsContainer, likesContainer);

        postElement.append(bodyContainer, footerContainer);
        postsContainer.appendChild(postElement);

    } else {
        const noPostsMessage = document.createElement("p");
        noPostsMessage.textContent = "Нет постов для отображения.";
        postsContainer.appendChild(noPostsMessage);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const post = await fetchPost(postId, token);
        console.log('hi', post);
        await renderPost(post);
        if (post.comments) {
            await renderComments(post);
            
        }
        if (window.location.hash === "#comments-section") {
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
                commentsSection.scrollIntoView({behavior: "smooth"});
            }
        }
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.addEventListener("click", async (event) => {
    const button = event.target.closest(".image-button");
    if (!button) return;

    const postId = button.dataset.id; 
    const img = button.querySelector("img");
    const communityId = button.dataset.communityId;
    console.log('communityId', communityId);
    const likesCountElement = button.parentElement.querySelector("#likes-count");

    if (!likesCountElement) return; 
    let likesCount = parseInt(likesCountElement.textContent, 10) || 0; 

    if (!token) {
        console.error("User is not authorized. Redirecting to login...");
        alert("Чтобы оценить пост необходимо авторизоваться.");
        window.location.href = "../authorization/authorization.html";
        return;
    }
    console.log(communityId)

    if (!communityId) {
        const canLike = await canUserLike(communityId, token);
        if (!canLike) {
            alert("Вы должны быть подписчиком или администратором, чтобы оценить этот пост.");
            return;
        }
    }
    
    if (img.alt === "heart") {
        const success = await likePost(postId, token); 
        if (success) {
            img.src = "../images/love.png";
            img.alt = "love";
            likesCountElement.textContent = likesCount + 1;
        }
    } else if (img.alt === "love") {
        const success = await dislikePost(postId, token);
        if (success) {
            img.src = "../images/heart.png";
            img.alt = "heart";
            likesCountElement.textContent = likesCount - 1;
        }
    }
});

document.getElementById("send-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const parentId = null;
    const content = document.getElementById('textarea').value;
    const data = {content, parentId}
    console.log(data);
    try {
        
        if (!content) {
            alert('Нельзя отправить пустой комментарий')
        }
        else if(!token){
            alert('Комментарии могут писать только авторизованные пользователи');
        }
        else if (token) {
            await postComment(data, postId, token);
            window.location.reload();
        }
        else{
            alert(error.message);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
});

document.addEventListener("click", async (event) => {
    const button = event.target.closest(".show-more-button");
    if (!button) return;
    const commentId = button.dataset.id;
    const commentElement = button.closest(".nested-comment") || button.closest(".container-comments-box");

    if (!commentId || !commentElement) {
        console.error("Не удалось найти ID комментария или его элемент.");
        return;
    }

    let nestedContainer = commentElement.querySelector(".nested-comments");

    if (nestedContainer) {
        nestedContainer.classList.toggle("hidden");
    } else {
        try {
            nestedContainer = await renderCommentsChain(commentId);
            commentElement.appendChild(nestedContainer);
        } catch (error) {
            console.error(`Ошибка при рендеринге вложенных комментариев для ID ${commentId}:`, error.message);
        }
    }
});

