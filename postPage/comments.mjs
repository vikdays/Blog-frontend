export async function renderComments(post) {
    const commentsContainer = document.querySelector(".container-comments");
    
    if (!post.comments || post.comments.length === 0) {
        if (commentsContainer) {
            commentsContainer.innerHTML = `<h2 class="container-comments-title">Комментарии</h2><p>Прокомментируйте первым!</p>`;
        }
        return; 
    }

    const commentsBox = document.querySelector(".container-comments-box");
    if (commentsBox) {
        commentsBox.innerHTML = "";
    }

    post.comments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("container-comments-box");
    
        commentElement.innerHTML = `
            <div class="pretitle">${comment.author}</div>
            <div class="content">${comment.content}
                <span class="modified-date">${comment.modifiedDate ? "(изменен)" : ""}</span>
            </div>
            <div class="pretitle">${new Date(comment.createTime).toLocaleString()}
                <button class="answer" data-id=${comment.id}>Ответить</button>
            </div>
        `;
        if (comment.subComments > 0) {
            const expandButton = document.createElement("button");
            expandButton.textContent = "Раскрыть ответы";
            expandButton.classList.add("show-more-button");
            commentElement.appendChild(expandButton);
        }
        commentsBox.appendChild(commentElement);
    });
}


export async function postComment(data, postId, token) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/comment`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) { 
            const errorText = await response.text();
            console.error("Ошибка при отправке комментария. Статус:", response.status, "Ответ:", errorText);
            return false;
        }

    } catch (error) {
        console.error("Ошибка при отправке комментария", error.message);
        return false;
    }
}


