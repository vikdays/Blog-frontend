export async function fetchPosts(filters = {}) {
    const baseUrl = "https://blog.kreosoft.space/api/post";
    const params = new URLSearchParams();

    // Добавляем параметры только если они определены
    params.append("onlyMyCommunities", filters.onlyMyCommunities || false);
    params.append("page", filters.page || 1);
    params.append("size", filters.size || 5);

    if (filters.author) params.append("author", filters.author);
    if (filters.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(" "));
    if (filters.min) params.append("min", filters.min);
    if (filters.max) params.append("max", filters.max);

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`);
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
                        <img src="../images/love.png" alt="love" id="love">
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } else {
        postsContainer.innerHTML = "<p>Нет постов для отображения.</p>";
    }
}

