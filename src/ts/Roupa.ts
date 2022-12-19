import { Product } from "./Product";

export class Roupa {
    id: string;
    name: string;
    price: number;
    parcelamento: Array<number>;
    color: string;
    image: string;
    size: Array<string>;
    date: string;

    public constructor(){}

    parseJson(json:string):Product[]{
        return <Roupa[]> JSON.parse(json);
    }

    
}