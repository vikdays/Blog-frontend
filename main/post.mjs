export async function fetchPosts(filters = {}, token = null) {
    const baseUrl = "https://blog.kreosoft.space/api/post";
    const params = new URLSearchParams();

    params.append("onlyMyCommunities", filters.onlyMyCommunities || false);
    params.append("page", filters.page || 1);
    params.append("size", filters.size || 5);

    if (filters.author) params.append("author", filters.author);
    if (filters.tags && filters.tags.length > 0) {
        filters.tags
            .filter(tag => tag.trim()) 
            .forEach(tag => params.append("tags", tag));
    }
    if (filters.min) params.append("min", filters.min);
    if (filters.max) params.append("max", filters.max);
    if (filters.postSorting) params.append("sorting", filters.postSorting);

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const url = `${baseUrl}?${params.toString()}`;
    
    try {
        console.log('filter', filters.tags)
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error("Ошибка загрузки постов");
        
        return await response.json();
    } catch (error) {
        console.error("Ошибка при запросе постов:", error.message);
        return { posts: [], pagination: { size: 0, count: 0, current: 1 } };
    }
}

export function renderPosts(posts) {
    const postsContainer = document.querySelector(".container-posts");
    if (!postsContainer) {
        console.error("Элемент .container-posts не найден");
        return;
    }
    postsContainer.innerHTML = ""; 

    if (posts && posts.length > 0) {
        posts.forEach(post => {
            console.log("Post data:", post);

            const maxLengthPost = 500;
            const isLong = post.description.length > maxLengthPost;
            const shortPost = post.description.slice(0, maxLengthPost);

            const postElement = document.createElement("div");
            postElement.classList.add("container-posts");

            const upperDiv = document.createElement("div");
            upperDiv.classList.add("upper");

            const pretitleDiv = document.createElement("div");
            pretitleDiv.classList.add("pretitle");
            pretitleDiv.textContent = `${post.author} - ${new Date(post.createTime).toLocaleString()} в сообществе "${post.communityName || "415"}"`;

            const titleLink = document.createElement("a");
            const titleHeading = document.createElement("h2");
            titleHeading.classList.add("post-title");
            titleHeading.dataset.id = post.id;
            titleHeading.dataset.communityId = post.communityId;
            titleHeading.textContent = post.title;
            titleLink.appendChild(titleHeading);

            upperDiv.appendChild(pretitleDiv);
            upperDiv.appendChild(titleLink);

            const downDiv = document.createElement("div");
            downDiv.classList.add("down");

            const postImgDiv = document.createElement("div");
            postImgDiv.classList.add("post-img");
            const postImg = document.createElement("img");
            postImg.id = "post-img";
            postImg.src = post.image || " ";
            postImgDiv.appendChild(postImg);

            const postDescriptionDiv = document.createElement("div");
            postDescriptionDiv.classList.add("post-description");

            const shortDescriptionSpan = document.createElement("span");
            shortDescriptionSpan.classList.add("short-description");
            shortDescriptionSpan.textContent = isLong ? shortPost + "..." : post.description;

            postDescriptionDiv.appendChild(shortDescriptionSpan);

            if (isLong) {
                const showMoreButton = document.createElement("button");
                showMoreButton.classList.add("show-more-btn");
                showMoreButton.textContent = "Показать полностью";

                const fullDescriptionSpan = document.createElement("span");
                fullDescriptionSpan.classList.add("full-description");
                fullDescriptionSpan.style.display = "none";
                fullDescriptionSpan.textContent = post.description;

                postDescriptionDiv.appendChild(showMoreButton);
                postDescriptionDiv.appendChild(fullDescriptionSpan);
            }

            const postTagsDiv = document.createElement("div");
            postTagsDiv.classList.add("post-tags");
            postTagsDiv.textContent = `#${post.tags.map(tag => tag.name).join(" #")}`;

            const postTimeDiv = document.createElement("div");
            postTimeDiv.classList.add("post-time");
            postTimeDiv.textContent = `Время чтения: ${post.readingTime} мин.`;

            downDiv.appendChild(postImgDiv);
            downDiv.appendChild(postDescriptionDiv);
            downDiv.appendChild(postTagsDiv);
            downDiv.appendChild(postTimeDiv);

            const footerDiv = document.createElement("div");
            footerDiv.classList.add("container-posts-footer");

            const commentsDiv = document.createElement("div");
            commentsDiv.classList.add("container-posts-comment");

            const commentsCountDiv = document.createElement("div");
            commentsCountDiv.id = "comments-count";
            commentsCountDiv.textContent = post.commentsCount;

            const commentImg = document.createElement("img");
            commentImg.src = "../images/comment.png";
            commentImg.alt = "comment";
            commentImg.id = "comment";
            commentImg.classList.add("comment");
            commentImg.dataset.communityId = post.communityId;
            commentImg.dataset.id = post.id;

            commentsDiv.appendChild(commentsCountDiv);
            commentsDiv.appendChild(commentImg);

            const likesDiv = document.createElement("div");
            likesDiv.classList.add("container-posts-likes");

            const likesCountDiv = document.createElement("div");
            likesCountDiv.id = "likes-count";
            likesCountDiv.textContent = post.likes;

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
            likesDiv.appendChild(likesCountDiv);
            likesDiv.appendChild(likeButton);

            footerDiv.appendChild(commentsDiv);
            footerDiv.appendChild(likesDiv);

            const bodyDiv = document.createElement("div");
            bodyDiv.classList.add("container-posts-body");
            bodyDiv.appendChild(upperDiv);
            bodyDiv.appendChild(downDiv);

            postElement.appendChild(bodyDiv);
            postElement.appendChild(footerDiv);

            postsContainer.appendChild(postElement);
        });
    } else {
        const noPostsMessage = document.createElement("p");
        noPostsMessage.textContent = "Нет постов для отображения.";
        postsContainer.appendChild(noPostsMessage);
    }
}


export async function likePost(postId, token) {
    console.log("Токен:", token); 

    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/like`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) { 
            const errorText = await response.text();
            console.error("Ошибка при лайке. Статус:", response.status, "Ответ:", errorText);
            return false;
        }

        console.log("Запрос на лайк выполнен успешно!");
        return true;

    } catch (error) {
        console.error("Ошибка при запросе на лайк:", error.message);
        return false;
    }
}

export async function dislikePost(postId, token) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/like`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return true; 
    } catch (error) {
        console.error(error.message);
        return false;
    }
}
export async function fetchPostDetails(postId, token) {
    const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        console.error("Не удалось получить данные о посте");
        return null;
    }

    const postData = await response.json();
    return postData;
}