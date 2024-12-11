let parentObjectId = null;  
let fieldCount = 0; 

const apiUrl = 'https://blog.kreosoft.space/api/address/search'; 
const container = document.querySelector('.address-container'); 

function initializeSelect2($element, placeholder) {
    $element.select2({
        placeholder: placeholder, 
        dropdownParent: $('.address-container'),
        ajax: {
            url: apiUrl, 
            dataType: 'json', 
            data: function (params) {
                return {
                    parentObjectId: parentObjectId, 
                    query: params.term 
                };
            },
            processResults: function (data) {
                return {
                    results: data.map(item => ({
                        objectGuid: item.objectGuid,
                        id: item.objectId, 
                        text: item.text, 
                        objectLevel: item.objectLevel,
                        objectLevelText: item.objectLevelText 
                    }))
                };
            },
            cache: true
        },
        minimumInputLength: 1,
        allowClear: true
    })
    .on('select2:select', function (e) {
        const data = e.params.data; 
        parentObjectId = data.id; 
        updateLabel(fieldCount, data.objectLevelText);
        if (data.objectLevel === 'Building') {
            console.log('Выбран последний уровень: Building');
            return;
        }
        fieldCount++;
        addNewSelectField('Следующий элемент адреса');
    })
    .on('select2:clear', function () {
        const currentFieldIndex = parseInt($element.attr('id').split('-')[1], 10);
        removeSubsequentFields(currentFieldIndex);
        parentObjectId = currentFieldIndex > 0 ? getParentIdFromPreviousField(currentFieldIndex - 1) : null;
    });
}

function getParentIdFromPreviousField(index) {
    const previousField = document.querySelector(`.field-${index}`);
    if (!previousField) return null;

    const select = previousField.querySelector('select');
    const selectedOption = $(select).select2('data');
    if (selectedOption.length > 0) {
        return selectedOption[0].id; 
    }
    return null;
}

function removeSubsequentFields(fromIndex) {
    for (let i = fromIndex + 1; i <= fieldCount; i++) {
        const sibling = document.querySelector(`.field-${i}`);
        if (sibling) sibling.remove();
    }
    fieldCount = fromIndex;
}

export function getAddressId() {
    const lastField = document.querySelector(`.field-${fieldCount}`);
    if (!lastField) return null;

    const select = lastField.querySelector('select');
    const selectedOption = $(select).select2('data'); 
    if (selectedOption.length > 0) {
        return selectedOption[0].objectGuid; 
    }
    return null; 
}

function addNewSelectField(labelText) {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = `container-field field-${fieldCount}`;

    const label = document.createElement('label');
    label.className = 'label';
    label.textContent = labelText; 

    const newSelect = document.createElement('select');
    newSelect.className = 'select';
    newSelect.id = `select-${fieldCount}`;

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(newSelect);
    container.appendChild(fieldWrapper);

    initializeSelect2($(newSelect), 'Не выбран');
}

function updateLabel(fieldIndex, newLabelText) {
    const fieldWrapper = document.querySelector(`.field-${fieldIndex}`);
    if (fieldWrapper) {
        const label = fieldWrapper.querySelector('.label');
        if (label) {
            label.textContent = newLabelText; 
        }
    }
}

$(document).ready(function () {
    parentObjectId = null;
    addNewSelectField('Субъект РФ');
});
