export interface ItemProps {
  id: string;
  name: string;
  createdAt: Date;
  version?: number;
}

export interface ItemPrimitives {
  id: string;
  name: string;
  createdAt: string;
  version: number;
}
