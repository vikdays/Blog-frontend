import { answerButtonClick } from './anwerComment.mjs';
import { editButtonClick } from './editComment.mjs';
import {deleteComment} from './deleteComment.mjs';
const userId = localStorage.getItem('userId');
export async function renderCommentsChain(commentId, container = null) {
    if (!container) {
        container = document.createElement("div");
        container.classList.add("nested-comments");
    }

    const nestedComments = await getCommentChain(commentId);
    if (!nestedComments || nestedComments.length === 0) {
        console.log(`Для комментария ${commentId} нет вложенных комментариев.`);
        return container;
    }

    nestedComments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("nested-comment");

        commentElement.innerHTML = `
            <div class="pretitle">${comment.content ? comment.author : '[Комментарий удален]'}</div>
            <div class="edit-form"></div>
            <div class="content">${comment.content ? comment.content : '[Комментарий удален]'}
                <span class="modified-date">${comment.modifiedDate && comment.content ? "(изменен)" : ""}</span>
            </div>
            <div class="pretitle">${comment.modifiedDate ? new Date(comment.modifiedDate).toLocaleString() : new Date(comment.createTime).toLocaleString()}
            </div>
        `;
        if (!comment.deleteDate && comment.authorId === userId) {
            const pretitle = commentElement.querySelector(".pretitle");
            const editButton = document.createElement("button");
            editButton.classList.add("edit-comment-btn");
            editButton.innerHTML = `<img id="edit" class="edit" src="../images/pencil.png">`;
            editButton.addEventListener("click", () => editButtonClick(commentElement, comment.id));

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-comment-btn");
            deleteButton.innerHTML = `<img id="delete" class="delete" src="../images/trash.png">`;
            deleteButton.addEventListener("click", () => deleteComment(commentElement, comment.id));

            pretitle.appendChild(editButton);
            pretitle.appendChild(deleteButton);
        }

        if (!comment.deleteDate) {
            const replyButton = document.createElement("button");
            replyButton.textContent = "Ответить";
            replyButton.classList.add("answer");
            replyButton.setAttribute("data-id", comment.id);

            const lastPretitle = commentElement.querySelector(".pretitle:last-child");
            lastPretitle.appendChild(replyButton);

            replyButton.addEventListener("click", () => answerButtonClick(commentElement, comment.id));
        }

        container.appendChild(commentElement);
    });

    return container;
}

export async function getCommentChain(commentId) {
    const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}/tree`, {
        method: "GET",
        headers: {
            'accept': 'application/json',
        },
    });

    if (!response.ok) { 
        const errorText = await response.text();
        console.error("Ошибка при получении вложенных комментариев. Статус:", response.status, "Ответ:", errorText);
        return false;
    }
    const data = await response.json();
    return data;

}