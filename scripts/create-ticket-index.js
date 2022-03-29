/* eslint-disable @typescript-eslint/no-var-requires */

const { Client } = require('@elastic/elasticsearch');

async function main() {
  const client = new Client({
    node: process.env.ES_URL,
  });

  await client.indices.create({
    index: 'ticket',
    body: {
      mappings: {
        dynamic: false,
        properties: {
          id: {
            type: 'long',
          },
          orgId: {
            type: 'long',
          },
          seq: {
            type: 'long',
          },
          categoryId: {
            type: 'long',
          },
          requesterId: {
            type: 'long',
          },
          assigneeId: {
            type: 'long',
          },
          title: {
            type: 'text',
            analyzer: 'ik_max_word',
            search_analyzer: 'ik_smart',
          },
          content: {
            type: 'text',
            analyzer: 'ik_max_word',
            search_analyzer: 'ik_smart',
          },
          replyCount: {
            type: 'integer',
          },
          status: {
            type: 'short',
          },
          createdAt: {
            type: 'date',
          },
          updatedAt: {
            type: 'date',
          },
        },
      },
    },
  });
}

main();
