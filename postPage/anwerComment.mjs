export async function renderAnswerComment(postId) {
    const commentsContainer = document.querySelector(".container-comments-box");
    commentsContainer.innerHTML = "";

    
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            const postElement = document.createElement("div");
            postElement.classList.add("container-comments-box");
        
            postElement.innerHTML = `
                <div class="pretitle">${comment.author}</div>
                <div class="content">${comment.content}
                    <span class="modified-date">${comment.modifiedDate ? "(изменен)" : ""}</span>
                </div>
                <div class="pretitle">${new Date(comment.createTime).toLocaleString()}
                    <button data-id=${comment.id}>Ответить</button>
                </div>
                <button>Раскрыть ответы</button>
            `;
            commentsContainer.appendChild(postElement);
        });
    }
}