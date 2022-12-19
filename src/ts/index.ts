import * as $ from 'jquery';
import { Product } from "./Product";

//Controller
const serverUrl = "http://localhost:5000";
let listaRoupas:Roupa[];

function main() {
  fetch(serverUrl+'/products').then(function(response) {
    return response.text();
  }).then(function(data){
    const roupa = new Roupa();
    listaRoupas= roupa.parseJson(data);
    popularProdutos(listaRoupas);
  });
}

function popularProdutos(listRoupas:Roupa[]){
  for(let roupa of listRoupas){
    let divProduto = $('<div/>').html(roupa.name);
    $('.conteudoprincipal').append(divProduto);
    //Preenche interface conteudoprincipal
  }
}

function filtrarProdutos(){
  
}

document.addEventListener("DOMContentLoaded", main);

//models
class Roupa implements Product{
  id: string;
  name: string;
  price: number;
  parcelamento: Array<number>;
  color: string;
  image: string;
  size: Array<string>;
  date: string;

  public constructor(){}

  parseJson(json:string):Roupa[]{
      // return <Roupa[]> JSON.parse(json);
      let listaObjetos = JSON.parse(json);
      let listaRoupas:Roupa[] = [];

      for(let obj of listaObjetos){
        let roupa = new Roupa();

        roupa.id = obj.id;
        roupa.id= obj.id;
        roupa.name= obj.name;
        roupa.price= obj.price;
        roupa.parcelamento= obj.parcelamento;
        roupa.color= obj.color;
        roupa.image= obj.image;
        roupa.size= obj.size;
        roupa.date= obj.date;

        listaRoupas.push(roupa);
      }

      return listaRoupas;
  }

  printRoupa():void {
    console.log("Teste");
  }
}

class Carrinho {
  private itens:Product[];
  private valorTotal:number;

  adicionarProduto(produto:Product){
    this.valorTotal += produto.price;
    this.itens.push(produto);
  }

  getTotalItens():number {
    return this.itens.length;
  }
}


/*Controle de menus interativos*/
$('.vermaiscores').click(function(){
  $('.menulateral ul .maiscores').toggleClass('mostra')
  $('.vermaiscores').toggleClass('some')
});

$('.ordenarMenuLateral').click(function(){
  $('.menuOrdenar ul .itensOrdenar').toggleClass('mostra')
});

