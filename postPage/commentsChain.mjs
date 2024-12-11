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

        const pretitle = document.createElement("div");
        pretitle.classList.add("pretitle");
        pretitle.textContent = comment.content ? comment.author : '[Комментарий удален]';

        const editForm = document.createElement("div");
        editForm.classList.add("edit-form");

        const content = document.createElement("div");
        content.classList.add("content");
        content.textContent = comment.content ? comment.content : '[Комментарий удален]';

        if (comment.modifiedDate && comment.content) {
            const modifiedDate = document.createElement("span");
            modifiedDate.classList.add("modified-date");
            modifiedDate.textContent = " (изменен)";
            content.appendChild(modifiedDate);
        }

        const datePretitle = document.createElement("div");
        datePretitle.classList.add("pretitle");
        datePretitle.textContent = comment.modifiedDate
            ? new Date(comment.modifiedDate).toLocaleString()
            : new Date(comment.createTime).toLocaleString();

        if (!comment.deleteDate && comment.authorId === userId) {
            const editButton = document.createElement("button");
            editButton.classList.add("edit-comment-btn");

            const editIcon = document.createElement("img");
            editIcon.id = "edit";
            editIcon.classList.add("edit");
            editIcon.src = "../images/pencil.png";

            editButton.appendChild(editIcon);
            editButton.addEventListener("click", () => editButtonClick(commentElement, comment.id));

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-comment-btn");

            const deleteIcon = document.createElement("img");
            deleteIcon.id = "delete";
            deleteIcon.classList.add("delete");
            deleteIcon.src = "../images/trash.png";

            deleteButton.appendChild(deleteIcon);
            deleteButton.addEventListener("click", () => deleteComment(commentElement, comment.id));

            pretitle.appendChild(editButton);
            pretitle.appendChild(deleteButton);
        }

        if (!comment.deleteDate) {
            const replyButton = document.createElement("button");
            replyButton.textContent = "Ответить";
            replyButton.classList.add("answer");
            replyButton.setAttribute("data-id", comment.id);

            replyButton.addEventListener("click", () => answerButtonClick(commentElement, comment.id));
            datePretitle.appendChild(replyButton);
        }

        commentElement.appendChild(pretitle);
        commentElement.appendChild(editForm);
        commentElement.appendChild(content);
        commentElement.appendChild(datePretitle);

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