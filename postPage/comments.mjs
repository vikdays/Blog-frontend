import { answerButtonClick } from './anwerComment.mjs';
import { editButtonClick } from './editComment.mjs';
import {deleteComment} from './deleteComment.mjs';
const userId = localStorage.getItem('userId');
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
            <div class="pretitle">${comment.author ? comment.author : '[Комментарий удален]'}
            ${comment.authorId === userId ? `
                <button class="edit-comment-btn">
                <img id="edit" class="edit" src="../images/pencil.png">
                </button>
                <button class="delete-comment-btn"><img id="delete" class="delete" src="../images/trash.png"></button>
                ` : ''}
            </div>
            <div class="edit-form"></div>
            <div class="content">${comment.content ? comment.content : '[Комментарий удален]'}
                <span class="modified-date">${comment.modifiedDate ? "(изменен)" : ""}</span>
            </div>
            <div class="pretitle">${new Date(comment.createTime).toLocaleString()}
            </div>
        `;
        if (comment.authorId === userId) {
            const editButton = commentElement.querySelector('.edit-comment-btn');
            editButton.addEventListener("click", () => editButtonClick(commentElement, comment.id));
            const deleteButton = commentElement.querySelector('.delete-comment-btn');
            deleteButton.addEventListener("click", () => deleteComment(commentElement, comment.id));
        }
        if (!comment.deleteDate) {
            const replyButton = document.createElement("button");
            replyButton.textContent = "Ответить";
            replyButton.classList.add("answer");
            replyButton.setAttribute("data-id", comment.id);
            commentElement.querySelector(".pretitle:last-child").appendChild(replyButton);

            replyButton.addEventListener("click", () => answerButtonClick(commentElement, comment.id));
        }

        if (comment.subComments > 0) {
            const expandButton = document.createElement("button");
            expandButton.textContent = "Раскрыть ответы";
            expandButton.classList.add("show-more-button");
            expandButton.setAttribute("data-id", comment.id);
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


