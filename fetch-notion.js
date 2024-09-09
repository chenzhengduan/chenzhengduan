const fetch = require('node-fetch');
const notionToken = 'secret_nQaS11XErjplQlmTWzy1g1Gq5ZvY0IUh4pQLaxfwpWY';  // Notion token
const pageId = '98468c08108e4de58fbb2152c66ce2f3';  // Notion 页面 ID
const notionUrl = `https://api.notion.com/v1/blocks/${pageId}/children`;

fetch(notionUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${notionToken}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => {
  console.log('API response:', data); // 打印 API 响应数据以进行调试
  if (!data.results) {
    throw new Error('No results found in API response');
  }

  // 提取页面内容并转换为 Markdown
  const blocks = data.results;
  let markdownContent = '';
  blocks.forEach(block => {
    if (block.type === 'paragraph') {
      markdownContent += block.paragraph.text.map(text => text.plain_text).join('') + '\n\n';
    }
  });

  // 企业微信 Webhook 发送消息
  const webhookUrl = 'http://111.230.107.130:8005/tansci/auth/webhook?key=2abc957c-2501-4467-9220-6efc5f12228e';
  const message = {
    msgtype: 'text',
    text: {
      content: `Notion 页面内容：\n${markdownContent}`,
    },
  };

  return fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
})
.then(response => response.json())
.then(data => {
  if (data.errcode === 0) {
    console.log('消息发送成功');
  } else {
    console.log('消息发送失败', data);
  }
})
.catch(error => {
  console.error('请求失败', error);
});
