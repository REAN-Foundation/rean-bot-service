export enum OperatorType {
    Logical      = 'Logical',
    Mathematical = 'Mathematical',
    Composition  = 'Composition',
    Iterate      = 'Iterate'
}

export const OperatorList: OperatorType[] = [
    OperatorType.Logical,
    OperatorType.Mathematical,
    OperatorType.Composition,
    OperatorType.Iterate,
];

export enum CompositionOperatorType {
    And  = 'And',
    Or   = 'Or',
    Xor  = 'Xor',
    None = 'None'
}

export const CompositionOperatorList: CompositionOperatorType[] = [
    CompositionOperatorType.And,
    CompositionOperatorType.Or,
    CompositionOperatorType.None,
];

export enum LogicalOperatorType {
    Equal                     = 'Equal',
    NotEqual                  = 'NotEqual',
    GreaterThan               = 'GreaterThan',
    GreaterThanOrEqual        = 'GreaterThanOrEqual',
    LessThan                  = 'LessThan',
    LessThanOrEqual           = 'LessThanOrEqual',
    In                        = 'In',
    NotIn                     = 'NotIn',
    Contains                  = 'Contains',
    IsEmpty                   = 'IsEmpty',
    IsNotEmpty                = 'IsNotEmpty',
    DoesNotContain            = 'DoesNotContain',
    Between                   = 'Between',
    IsTrue                    = 'IsTrue',
    IsFalse                   = 'IsFalse',
    Exists                    = 'Exists',
    HasConsecutiveOccurrences = 'HasConsecutiveOccurrences', //array, checkFor, numTimes
    RangesOverlap             = 'RangesOverlap',
    None                      = 'None',
}

export const LogicalOperatorList: LogicalOperatorType[] = [
    LogicalOperatorType.Equal,
    LogicalOperatorType.NotEqual,
    LogicalOperatorType.GreaterThan,
    LogicalOperatorType.GreaterThanOrEqual,
    LogicalOperatorType.LessThan,
    LogicalOperatorType.LessThanOrEqual,
    LogicalOperatorType.In,
    LogicalOperatorType.NotIn,
    LogicalOperatorType.Contains,
    LogicalOperatorType.IsEmpty,
    LogicalOperatorType.IsNotEmpty,
    LogicalOperatorType.DoesNotContain,
    LogicalOperatorType.Between,
    LogicalOperatorType.IsTrue,
    LogicalOperatorType.IsFalse,
    LogicalOperatorType.Exists,
    LogicalOperatorType.HasConsecutiveOccurrences,
    LogicalOperatorType.RangesOverlap,
    LogicalOperatorType.None,
];

export enum MathematicalOperatorType {
    Add        = 'Add',
    Subtract   = 'Subtract',
    Divide     = 'Divide',
    Multiply   = 'Multiply',
    Percentage = 'Percentage',
    None       = 'None',
}

export const MathematicalOperatorList: MathematicalOperatorType[] = [
    MathematicalOperatorType.Add,
    MathematicalOperatorType.Subtract,
    MathematicalOperatorType.Divide,
    MathematicalOperatorType.Multiply,
    MathematicalOperatorType.Percentage,
    MathematicalOperatorType.None,
];

export enum OperandDataType {
    Float        = 'Float',
    Integer      = 'Integer',
    Boolean      = 'Boolean',
    Text         = 'Text',
    Array        = 'Array',
    Object       = 'Object',
    Date         = 'Date',
    TextArray    = 'TextArray',
    IntegerArray = 'IntegerArray',
    FloatArray   = 'FloatArray',
    BooleanArray = 'BooleanArray',
}

export const ConditionOperandDataTypeList: OperandDataType[] = [
    OperandDataType.Float,
    OperandDataType.Integer,
    OperandDataType.Boolean,
    OperandDataType.Text,
    OperandDataType.Array,
    OperandDataType.Object,
    OperandDataType.Date,
    OperandDataType.TextArray,
    OperandDataType.IntegerArray,
    OperandDataType.FloatArray,
    OperandDataType.BooleanArray,
];

export enum ExecutionStatus {
    Pending  = "Pending",
    Executed = "Executed",
    Waiting  = "Waiting",
    Exited   = "Exited",
}

export const ExecutionStatusList: ExecutionStatus[] = [
    ExecutionStatus.Pending,
    ExecutionStatus.Executed,
    ExecutionStatus.Waiting,
    ExecutionStatus.Exited,
];

export enum InputSourceType {
    UserEvent    = "UserEvent",
    SystemEvent  = "SystemEvent",
    SystemData   = "SystemData",
    Database     = "Database",
    Almanac      = "Almanac",
    ApiEndpoint  = "ApiEndpoint",
    CsvDocument  = "CsvDocument",
    ExcelSheet   = "ExcelSheet",
    JSON         = "JSON",
    JSONFile     = "JSONFile",
    CustomObject = "CustomObject",
}

export const InputSourceTypeList: InputSourceType[] = [
    InputSourceType.UserEvent,
    InputSourceType.SystemEvent,
    InputSourceType.SystemData,
    InputSourceType.Database,
    InputSourceType.Almanac,
    InputSourceType.ApiEndpoint,
    InputSourceType.CsvDocument,
    InputSourceType.ExcelSheet,
    InputSourceType.JSON,
    InputSourceType.JSONFile,
    InputSourceType.CustomObject,
];
