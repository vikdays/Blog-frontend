import { answerButtonClick } from './anwerComment.mjs';
import { editButtonClick } from './editComment.mjs';
import {deleteComment} from './deleteComment.mjs';
const userId = localStorage.getItem('userId');

export async function renderComments(post) {
    const commentsContainer = document.querySelector(".container-comments");

    if (!post.comments || post.comments.length === 0) {
        if (commentsContainer) {
            const title = document.createElement('h2');
            title.classList.add('container-comments-title');
            title.textContent = 'Комментарии';

            const message = document.createElement('p');
            message.textContent = 'Прокомментируйте первым!';

            commentsContainer.innerHTML = '';
            commentsContainer.appendChild(title);
            commentsContainer.appendChild(message);
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

        const isDeleted = !comment.content;

        const pretitle = document.createElement('div');
        pretitle.classList.add('pretitle');
        pretitle.textContent = isDeleted ? '[Комментарий удален]' : comment.author;

        if (!isDeleted && comment.authorId === userId) {
            const editButton = document.createElement('button');
            editButton.classList.add('edit-comment-btn');

            const editIcon = document.createElement('img');
            editIcon.id = 'edit';
            editIcon.classList.add('edit');
            editIcon.src = '../images/pencil.png';

            editButton.appendChild(editIcon);
            editButton.addEventListener("click", () => editButtonClick(commentElement, comment.id));
            pretitle.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-comment-btn');

            const deleteIcon = document.createElement('img');
            deleteIcon.id = 'delete';
            deleteIcon.classList.add('delete');
            deleteIcon.src = '../images/trash.png';

            deleteButton.appendChild(deleteIcon);
            deleteButton.addEventListener("click", () => deleteComment(commentElement, comment.id));
            pretitle.appendChild(deleteButton);
        }

        commentElement.appendChild(pretitle);

        const editForm = document.createElement('div');
        editForm.classList.add('edit-form');
        commentElement.appendChild(editForm);

        const content = document.createElement('div');
        content.classList.add('content');
        content.textContent = isDeleted ? '[Комментарий удален]' : comment.content;

        if (comment.modifiedDate && comment.content) {
            const modifiedDate = document.createElement('span');
            modifiedDate.classList.add('modified-date');
            modifiedDate.textContent = ' (изменен)';
            content.appendChild(modifiedDate);
        }

        commentElement.appendChild(content);

        const timeInfo = document.createElement('div');
        timeInfo.classList.add('pretitle');
        timeInfo.textContent = comment.modifiedDate
            ? new Date(comment.modifiedDate).toLocaleString()
            : new Date(comment.createTime).toLocaleString();
        commentElement.appendChild(timeInfo);

        if (!comment.deleteDate && !isDeleted) {
            const replyButton = document.createElement('button');
            replyButton.textContent = 'Ответить';
            replyButton.classList.add('answer');
            replyButton.setAttribute('data-id', comment.id);

            replyButton.addEventListener("click", () => answerButtonClick(commentElement, comment.id));
            timeInfo.appendChild(replyButton);
        }

        if (comment.subComments > 0) {
            const expandButton = document.createElement('button');
            expandButton.textContent = 'Раскрыть ответы';
            expandButton.classList.add('show-more-button');
            expandButton.setAttribute('data-id', comment.id);

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


