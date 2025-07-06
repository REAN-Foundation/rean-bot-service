import {
    IntentRecognitionResult,
    IntentTrainingData,
    IntentConfig,
    EntityDefinition,
    IntentConfidence
} from '../../domain.types/intent.types';
import { ConversationContextData } from '../../domain.types/context.types';

export interface TrainingOptions {
    modelVersion?: string;
    validateData?: boolean;
    incremental?: boolean;
    batchSize?: number;
    epochs?: number;
    learningRate?: number;
}

export interface RecognitionOptions {
    includeEntities?: boolean;
    minConfidence?: number;
    maxResults?: number;
    useContext?: boolean;
    fallbackToRule?: boolean;
}

export interface ModelPerformance {
    accuracy: number;
    precision: Record<string, number>;
    recall: Record<string, number>;
    f1Score: Record<string, number>;
    confusionMatrix: Record<string, Record<string, number>>;
    totalSamples: number;
    trainingTime: number;
    lastTrained: Date;
}

export interface IIntentRecognizer {

    //#region Core Recognition

    /**
     * Recognize intent from text input
     */
    recognizeIntent(
        text: string,
        context?: ConversationContextData,
        options?: RecognitionOptions
    ): Promise<IntentRecognitionResult>;

    /**
     * Recognize multiple possible intents
     */
    recognizeMultipleIntents(
        text: string,
        context?: ConversationContextData,
        options?: RecognitionOptions
    ): Promise<IntentRecognitionResult[]>;

    /**
     * Extract entities from text
     */
    extractEntities(
        text: string,
        intents?: string[],
        context?: ConversationContextData
    ): Promise<Record<string, any>>;

    //#endregion

    //#region Intent Management

    /**
     * Add new intent definition
     */
    addIntent(intent: IntentConfig): Promise<void>;

    /**
     * Update intent definition
     */
    updateIntent(
        intentName: string,
        updates: Partial<IntentConfig>
    ): Promise<void>;

    /**
     * Remove intent definition
     */
    removeIntent(intentName: string): Promise<void>;

    /**
     * Get all intents
     */
    getIntents(): Promise<IntentConfig[]>;

    /**
     * Get intent by name
     */
    getIntent(intentName: string): Promise<IntentConfig | null>;

    //#endregion

    //#region Entity Management

    /**
     * Add entity definition
     */
    addEntity(entity: EntityDefinition): Promise<void>;

    /**
     * Update entity definition
     */
    updateEntity(
        entityName: string,
        updates: Partial<EntityDefinition>
    ): Promise<void>;

    /**
     * Remove entity definition
     */
    removeEntity(entityName: string): Promise<void>;

    /**
     * Get all entities
     */
    getEntities(): Promise<EntityDefinition[]>;

    /**
     * Get entity by name
     */
    getEntity(entityName: string): Promise<EntityDefinition | null>;

    //#endregion

    //#region Training

    /**
     * Train the model with training data
     */
    trainModel(
        trainingData: IntentTrainingData[],
        options?: TrainingOptions
    ): Promise<{
        success: boolean;
        modelVersion: string;
        performance: ModelPerformance;
        errors?: string[];
    }>;

    /**
     * Add training samples
     */
    addTrainingSamples(
        samples: IntentTrainingData[]
    ): Promise<void>;

    /**
     * Get training data
     */
    getTrainingData(
        intentName?: string,
        limit?: number,
        offset?: number
    ): Promise<IntentTrainingData[]>;

    /**
     * Validate training data
     */
    validateTrainingData(
        data: IntentTrainingData[]
    ): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
        stats: {
            totalSamples: number;
            intentsCount: number;
            entitiesCount: number;
            duplicates: number;
        };
    }>;

    //#endregion

    //#region Model Management

    /**
     * Get model information
     */
    getModelInfo(): Promise<{
        version: string;
        createdAt: Date;
        lastTrained: Date;
        performance: ModelPerformance;
        intentsCount: number;
        entitiesCount: number;
        samplesCount: number;
    }>;

    /**
     * Export model
     */
    exportModel(): Promise<{
        modelData: any;
        metadata: {
            version: string;
            exportedAt: Date;
            intents: string[];
            entities: string[];
        };
    }>;

    /**
     * Import model
     */
    importModel(
        modelData: any,
        metadata: any
    ): Promise<{
        success: boolean;
        version: string;
        errors?: string[];
    }>;

    //#endregion

    //#region Analytics

    /**
     * Get recognition statistics
     */
    getRecognitionStats(
        timeRange?: { start: Date; end: Date }
    ): Promise<{
        totalRecognitions: number;
        intentDistribution: Record<string, number>;
        confidenceDistribution: Record<IntentConfidence, number>;
        averageConfidence: number;
        failureRate: number;
        responseTime: {
            average: number;
            p95: number;
            p99: number;
        };
    }>;

    /**
     * Get model performance metrics
     */
    getPerformanceMetrics(): Promise<ModelPerformance>;

    /**
     * Analyze recognition patterns
     */
    analyzePatterns(
        timeRange?: { start: Date; end: Date }
    ): Promise<{
        commonPhrases: Array<{ phrase: string; intent: string; count: number }>;
        confusionPairs: Array<{ intent1: string; intent2: string; count: number }>;
        lowConfidencePatterns: Array<{ pattern: string; avgConfidence: number }>;
        suggestions: string[];
    }>;

    //#endregion

    //#region Configuration

    /**
     * Configure recognizer settings
     */
    configure(settings: {
        defaultConfidenceThreshold?: number;
        maxEntityLength?: number;
        enableContextLearning?: boolean;
        enableFallbackRules?: boolean;
        cacheSize?: number;
    }): Promise<void>;

    /**
     * Get current configuration
     */
    getConfiguration(): Promise<Record<string, any>>;

    //#endregion

}
