export interface MongoDota2Hero {
    name: string;
    imageUrl: string;
    type: string;
    icon: string;
}

export interface MongoHeroDetail {
    _id: string;
    name: string;
    attackType: string;
    otherName: string;
    story: string;
    strengthStart: number;
    strengthGrow: string;
    agilityStart: number;
    agilityGrow: string;
    intelligenceStart: number;
    intelligenceGrow: string;
    attackPower: number;
    attackSpeed: number;
    armor: number;
    speed: number;
    talent25Left: string;
    talent25Right: string;
    talent20Left: string;
    talent20Right: string;
    talent15Left: string;
    talent15Right: string;
    talent10Left: string;
    talent10Right: string;
    abilities: MongoHeroAbility;
}

export interface MongoHeroAbility {
    name: string;
    imageUrl: string;
    annotation: string;
    description: string;
    magicConsumption: string;
    coolDown: string;
    tips: string;
    attributes: any,
    num: number;
}

export interface DotaNews {
    href: string;
    img: string;
    title: string;
    content: string;
    date: string;
}

export interface DotaNewsNode{
    type: 'img' | 'br' | 'p' | 'b'
    content: string;
}
