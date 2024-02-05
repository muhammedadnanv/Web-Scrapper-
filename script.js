document.addEventListener('DOMContentLoaded', function () {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const outputDiv = document.getElementById('output');

  let scrapedContent = '';

  scrapeBtn.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: scrapeContent
      });
    });
  });

  function scrapeContent() {
    scrapedContent = document.body.innerText;
    chrome.runtime.sendMessage({ content: scrapedContent });
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.content) {
      outputDiv.textContent = message.content;
      downloadBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', function () {
    if (scrapedContent) {
      const pdfFileName = 'scraped_content.pdf';
      const pdfOptions = {
        margin: 10,
        filename: pdfFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(outputDiv).set(pdfOptions).outputPdf(function (pdfBlob) {
        const blobUrl = URL.createObjectURL(pdfBlob);
        chrome.downloads.download({ url: blobUrl, filename: pdfFileName });
      });
    }
  });
});
