// import { injectable } from 'tsyringe';
// import OpenAI from 'openai';
// import { PineconeStore } from '@langchain/pinecone';
// import { OpenAIEmbeddings } from '@langchain/openai';
// // import { createRetrievalChain } from '@langchain/core/chains';
// // import { env } from '../../config/environment.config';
// import { logger } from '../../logger/logger';

// @injectable()
// export class RAGQAService {

//     private openai: OpenAI;

//     private vectorStore: PineconeStore | null = null;

//     // private qaChain: any | null = null;

//     constructor() {
//         this.openai = new OpenAI({
//             apiKey : process.env.OPENAI_API_KEY
//         });
//     }

//     async initialize(tenantId: string): Promise<void> {
//         try {
//             const embeddings = new OpenAIEmbeddings({
//                 openAIApiKey : process.env.OPENAI_API_KEY
//             });

//             // Initialize vector store for tenant
//             // this.vectorStore = new PineconeStore(embeddings, {
//             //     pineconeIndex : process.env.PINECONE_INDEX!,
//             //     namespace     : `tenant_${tenantId}`
//             // });

//             // Create QA chain
//             // this.qaChain = createRetrievalChain(
//             //   this.openai as any,
//             //   this.vectorStore.asRetriever({
//             //       k          : 4,
//             //       searchType : 'similarity'
//             //   }),
//             //   {
//             //       returnSourceDocuments : true
//             //   }
//             // );

//         } catch (error) {
//             logger.error(`RAG initialization failed: ${error}`);
//         }
//     }

//     async query(question: string, context: any): Promise<any> {
//         // if (!this.qaChain) {
//         //     return {
//         //         answer     : "I'm sorry, but I don't have access to the knowledge base right now.",
//         //         sources    : [],
//         //         confidence : 0
//         //     };
//         // }

//         // try {
//         //     const result = await this.qaChain.call({
//         //         query   : question,
//         //         context : JSON.stringify(context)
//         //     });

//         //     return {
//         //         answer     : result.text,
//         //         sources    : result.sourceDocuments || [],
//         //         confidence : this.calculateConfidence(result)
//         //     };

//         // } catch (error) {
//         //     logger.error(`RAG query failed: ${error}`);
//         //     return {
//         //         answer     : "I encountered an error while searching for information.",
//         //         sources    : [],
//         //         confidence : 0
//         //     };
//         // }
//     }

//     private calculateConfidence(result: any): number {
//     // Simple confidence calculation based on source document scores
//         if (!result.sourceDocuments || result.sourceDocuments.length === 0) {
//             return 0.3;
//         }

//         const avgScore = result.sourceDocuments.reduce((sum: number, doc: any) => {
//             return sum + (doc.metadata?.score || 0.5);
//         }, 0) / result.sourceDocuments.length;

//         return Math.min(avgScore, 0.95);
//     }

// }
