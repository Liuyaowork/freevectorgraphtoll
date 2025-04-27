document.getElementById('fileInput').addEventListener('change', function () {
    const files = this.files;
    if (files.length) {
        // 更新状态显示
        updateStatusDisplay(files.length, 0, files.length);
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput'); // 显式获取 fileInput
    const formatSelect = document.getElementById('formatSelect');
    const resultSection = document.getElementById('resultSection');
    const previewContainer = document.getElementById('previewContainer');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const downloadLink = document.getElementById('downloadLink');

    const files = fileInput.files;
    if (!files.length) {
        alert('请上传图片文件！');
        return;
    }

    // 修复：仅在拖拽上传时更新文件数量显示
    if (!event.isTrusted) {
        updateStatusDisplay(files.length, 0, files.length);
    }

    const targetFormat = formatSelect.value;
    progressContainer.style.display = 'block';
    progressBar.value = 0;

    previewContainer.innerHTML = '';
    resultSection.style.display = 'none';

    const convertedFiles = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        // 模拟转换过程
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟

        // 如果目标格式是 SVG，嵌入原始图片数据
        let fileContent;
        let previewUrl;
        if (targetFormat === 'svg') {
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]); // 获取 Base64 数据
                reader.readAsDataURL(file);
            });

            fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <image href="data:${file.type};base64,${base64Data}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
</svg>`;
            previewUrl = `data:image/svg+xml;base64,${btoa(fileContent)}`; // 生成预览 URL
        } else {
            // 对于其他格式，保留原始文件内容
            fileContent = await file.text();
            previewUrl = URL.createObjectURL(new Blob([fileContent], { type: `image/${targetFormat}` }));
        }

        const blob = new Blob([fileContent.trim()], { type: `image/${targetFormat}` }); // 确保内容没有多余空白

        // 使用原文件名并替换扩展名
        const originalName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
        convertedFiles.push({ file: blob, name: originalName });

        // 更新进度条
        progressBar.value = ((i + 1) / totalFiles) * 100;

        // 更新状态显示
        updateStatusDisplay(files.length, i + 1, totalFiles);

        // 添加预览
        const img = document.createElement('img');
        img.src = previewUrl; // 使用预览 URL
        img.alt = `预览图 ${i + 1}`;
        img.style.maxWidth = '100px';
        img.style.margin = '5px';
        previewContainer.appendChild(img);
    }

    // 合并所有文件为一个压缩包下载
    const downloadContainer = document.getElementById('fixedDownloadContainer');
    downloadContainer.innerHTML = ''; // 清空之前的下载链接

    const zip = new JSZip(); // 使用 JSZip 创建压缩包
    convertedFiles.forEach(({ file, name }) => {
        zip.file(name, file); // 添加实际文件到压缩包
    });

    const zipButton = document.createElement('button');
    zipButton.textContent = '下载所有文件 (压缩包)';
    zipButton.style.display = 'inline-block';
    zipButton.style.backgroundColor = '#008CBA'; // 蓝色背景
    zipButton.style.color = '#FFFFFF'; // 白色文字
    zipButton.style.padding = '10px 20px';
    zipButton.style.borderRadius = '5px';
    zipButton.style.border = 'none';
    zipButton.style.cursor = 'pointer';
    zipButton.style.marginTop = '10px';

    zipButton.addEventListener('click', async () => {
        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = 'converted_files.zip';
        document.body.appendChild(link); // 确保链接被添加到 DOM 中
        link.click();
        document.body.removeChild(link); // 点击后移除链接
    });

    downloadContainer.appendChild(zipButton);
    downloadContainer.style.display = 'flex'; // 确保容器始终显示
    resultSection.style.display = 'block';
});

// 更新状态显示的函数
function updateStatusDisplay(uploadedCount, convertedCount, totalCount) {
    const statusDisplay = document.getElementById('statusDisplay');
    statusDisplay.textContent = `已上传文件数量：${uploadedCount} | 已转换完成：${convertedCount}/${totalCount}`;
}

// 添加样式美化外观和文件拖拽上传功能
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.backgroundColor = '#FFFFFF'; // 设置背景为纯白色

    const uploadButton = document.querySelector('button[type="submit"]');
    if (uploadButton) {
        uploadButton.style.backgroundColor = '#4CAF50'; // 绿色背景
        uploadButton.style.color = '#FFFFFF'; // 白色文字
        uploadButton.style.border = 'none';
        uploadButton.style.padding = '10px 20px';
        uploadButton.style.borderRadius = '5px';
        uploadButton.style.cursor = 'pointer';
    }

    const downloadLink = document.getElementById('downloadLink');
    if (downloadLink) {
        downloadLink.style.display = 'inline-block';
        downloadLink.style.backgroundColor = '#008CBA'; // 蓝色背景
        downloadLink.style.color = '#FFFFFF'; // 白色文字
        downloadLink.style.padding = '10px 20px';
        downloadLink.style.borderRadius = '5px';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.marginTop = '10px';
    }

    // 优化选择文件按钮外观
    const fileInputLabel = document.querySelector('label[for="fileInput"]');
    if (fileInputLabel) {
        fileInputLabel.style.display = 'inline-block';
        fileInputLabel.style.backgroundColor = '#4CAF50'; // 绿色背景
        fileInputLabel.style.color = '#FFFFFF'; // 白色文字
        fileInputLabel.style.padding = '10px 20px';
        fileInputLabel.style.borderRadius = '5px';
        fileInputLabel.style.cursor = 'pointer';
        fileInputLabel.style.textAlign = 'center';
        fileInputLabel.style.marginBottom = '10px';
    }
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.style.display = 'none'; // 隐藏原始文件输入框
    }

    // 添加拖拽上传功能
    const dropArea = document.getElementById('dropArea');
    if (dropArea) { // 检查 dropArea 是否存在
        dropArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropArea.classList.add('dragover');
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });

        dropArea.addEventListener('drop', (event) => {
            event.preventDefault();
            dropArea.classList.remove('dragover');
            const files = event.dataTransfer.files;
            if (files.length) {
                const dataTransfer = new DataTransfer();
                for (let i = 0; i < files.length; i++) {
                    dataTransfer.items.add(files[i]);
                }
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.files = dataTransfer.files; // 使用 DataTransfer 赋值

                // 更新状态显示
                updateStatusDisplay(files.length, 0, files.length);
            }
        });
    }

    // 初始化状态显示
    const statusDisplay = document.createElement('p');
    statusDisplay.id = 'statusDisplay';
    statusDisplay.style.marginTop = '10px';
    statusDisplay.style.fontWeight = 'bold';
    statusDisplay.textContent = '已上传文件数量：0 | 已转换完成：0/0';
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.appendChild(statusDisplay);
    } else {
        console.error('未找到 .upload-section 元素，无法初始化状态显示。');
    }
    
    // 在页面底部添加提示信息
    const footer = document.querySelector('footer');
    if (footer) {
        const notice = document.createElement('p');
        notice.textContent = '所有上传数据将在关闭网页后被删除。';
        notice.style.fontSize = '0.9em';
        notice.style.color = '#ff0000'; // 红色文字
        footer.insertBefore(notice, footer.firstChild); // 插入到 footer 的第一个子元素之前
    }

    // 动态创建清除按钮
    const clearButton = document.createElement('button');
    clearButton.textContent = '清除图片';
    clearButton.style.backgroundColor = '#f44336'; // 红色背景
    clearButton.style.color = '#FFFFFF'; // 白色文字
    clearButton.style.border = 'none';
    clearButton.style.padding = '10px 20px';
    clearButton.style.borderRadius = '5px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.marginTop = '10px';

    clearButton.addEventListener('click', () => {
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const statusDisplay = document.getElementById('statusDisplay');
        const progressContainer = document.getElementById('progressContainer');
        const resultSection = document.getElementById('resultSection');

        if (fileInput) fileInput.value = ''; // 清空文件输入框
        if (previewContainer) previewContainer.innerHTML = ''; // 清空预览内容
        if (statusDisplay) statusDisplay.textContent = '已上传文件数量：0 | 已转换完成：0/0'; // 重置状态显示
        if (progressContainer) progressContainer.style.display = 'none'; // 隐藏进度条
        if (resultSection) resultSection.style.display = 'none'; // 隐藏结果部分
    });

    if (uploadSection) {
        uploadSection.appendChild(clearButton); // 将清除按钮添加到上传部分
    } else {
        console.error('未找到 .upload-section 元素，无法添加清除按钮。');
    }
});

// 页面卸载时清除数据
window.addEventListener('beforeunload', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = ''; // 清空文件输入框
    }
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = ''; // 清空预览内容
    }
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay) {
        statusDisplay.textContent = '已上传文件数量：0 | 已转换完成：0/0'; // 重置状态显示
    }
});
