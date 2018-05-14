// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote, shell } = require('electron');
const { dialog } = remote;
const setApplicationMenu = require('./menu');

const form = document.querySelector('form');
const ecr_refresh_form = document.querySelector('form[id=ecr_refresh');
const local_images_refresh_form = document.querySelector('form[id=local_images_refresh');


const inputs = {
    source: form.querySelector('input[name="source"]'),
    destination: form.querySelector('input[name="destination"]'),
    name: form.querySelector('input[name="name"]'),
    fps: form.querySelector('input[name="fps"]'),

    ecr_img_filter: ecr_refresh_form.querySelector('input[name="ecr_img_filter"]'),

    local_img_filter: local_images_refresh_form.querySelector('input[name="local_img_filter"]'),

};


const buttons = {
    source: document.getElementById('chooseSource'),
    destination: document.getElementById('chooseDestination'),
    submit: form.querySelector('button[type="submit"]'),
};

ipcRenderer.on('did-finish-load', () => {
    setApplicationMenu();
});

ipcRenderer.on('processing-did-succeed', (event, html) => {
    shell.openExternal(`file://${html}`);
});

ipcRenderer.on('processing-did-fail', (event, error) => {
    console.error(error);
    alert('Failed :\'(');
});


document.getElementById('ecr_refresh').addEventListener('submit', (event) => {
    event.preventDefault();
    ipcRenderer.send('did-submit-ecr-form', {
        ecr_img_filter: inputs.ecr_img_filter.value,
    });
});

ipcRenderer.on('showEcrImageList', function (event, image_html) {
    jQuery('#ecr_image_list').html(image_html);
});

document.getElementById('local_images_refresh').addEventListener('submit', (event) => {
    event.preventDefault();
    ipcRenderer.send('did-submit-local-form', {
        local_img_filter: inputs.local_img_filter.value,
    });
});

ipcRenderer.on('showLocalImageList', function (event, image_html) {
    jQuery('#local_images_list').html(image_html);
});

document.getElementById('containers').addEventListener('submit', (event) => {
    event.preventDefault();
    ipcRenderer.send('did-submit-container-form', {
        //ecr_img_filter: inputs.ecr_img_filter.value,
    });
});

ipcRenderer.on('showContainerList', function (event, container_html) {
    jQuery('#container_list').html(container_html);
});


