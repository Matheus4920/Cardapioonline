import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function addCustomizations() {
  const snapshot = await getDocs(collection(db, 'products'));
  for (const productDoc of snapshot.docs) {
    const name = productDoc.data().name;
    let removableIngredients: string[] = [];
    let addOns: {name: string, price: number}[] = [];

    if (name.includes('Burger')) {
      removableIngredients = ['Cebola Roxa', 'Tomate', 'Picles', 'Molho Especial'];
      addOns = [{ name: 'Bacon Extra', price: 6.90 }, { name: 'Queijo Extra', price: 4.90 }, { name: 'Hambúrguer Extra', price: 12.90 }];
    } else if (name.includes('Quesadillas') || name.includes('Dillas')) {
      removableIngredients = ['Pimenta Jalapeño', 'Cebola', 'Tomate'];
      addOns = [{ name: 'Guacamole Extra', price: 8.90 }, { name: 'Sour Cream Extra', price: 6.90 }];
    } else if (name.includes('Ribs')) {
      addOns = [{ name: 'Molho Barbecue Extra', price: 4.90 }, { name: 'Fritas Extra', price: 14.90 }];
    } else if (name.includes('S’mores')) {
      addOns = [{ name: 'Bola de Sorvete', price: 9.90 }, { name: 'Calda de Chocolate', price: 4.90 }];
    } else {
      removableIngredients = ['Cebola', 'Tomate'];
      addOns = [{ name: 'Molho Extra', price: 4.90 }];
    }

    await updateDoc(doc(db, 'products', productDoc.id), {
      removableIngredients,
      addOns
    });
    console.log(`Updated ${name} with customizations`);
  }
  process.exit(0);
}

addCustomizations().catch(console.error);
