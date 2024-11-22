export async function fetchPosts(filters = {}, token = null) {
    const baseUrl = "https://blog.kreosoft.space/api/post";
    const params = new URLSearchParams();

    params.append("onlyMyCommunities", filters.onlyMyCommunities || false);
    params.append("page", filters.page || 1);
    params.append("size", filters.size || 20);

    if (filters.author) params.append("author", filters.author);
    if (filters.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(" "));
    if (filters.min) params.append("min", filters.min);
    if (filters.max) params.append("max", filters.max);

    let url = `${baseUrl}?${params.toString()}`;

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error("Failed to fetch posts");
        return await response.json();
    } catch (error) {
        console.error("Error fetching posts:", error);
        return { posts: [], pagination: {} }; 
    }
}

export function renderPosts(posts) {
    const postsContainer = document.querySelector(".container-posts");
    postsContainer.innerHTML = "";

    if (posts && posts.length > 0) {
        posts.forEach(post => {
            console.log("Post data:", post);
            const postElement = document.createElement("div");
            postElement.classList.add("container-posts");

            postElement.innerHTML = `
                <div class="container-posts-body">
                    <div class="upper">
                        <div class="pretitle">${post.author} - ${new Date(post.createTime).toLocaleString()} в сообществе "${post.communityName}"</div>
                        <h2 class="post-title">${post.title}</h2>
                    </div>
                    <div class="down">
                        <div class="post-description">${post.description}</div>
                        <div class="post-tags">#${post.tags.map(tag => tag.name).join(" #")}</div>
                        <div class="post-time">Время чтения: ${post.readingTime} мин.</div>
                    </div>
                </div>
                <div class="container-posts-footer">
                    <div class="container-posts-comment">
                        <div id="comments-count">${post.commentsCount}</div>
                        <img src="../images/comment.png" alt="comment" id="comment">
                    </div>
                    <div class="container-posts-likes">
                        <div id="likes-count">${post.likes}</div>
                         <button class="image-button" data-id="${post.id}">
                            <img id="like" class="like-img"
                                src="${post.hasLike ? "../images/love.png" : "../images/heart.png"}" 
                                alt="${post.hasLike ? "love" : "heart"}" 
                            >
                        </button>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } else {
        postsContainer.innerHTML = "<p>Нет постов для отображения.</p>";
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