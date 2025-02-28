export interface Spin {
  id: string;
  customerName: string;
  email: string;
  award: string;
  isSpecialPrize: boolean;
  isDisbursed: boolean;
  createdAt: string;
}

export interface WheelData {
  option: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    fontStyle?: string;
  };
} 