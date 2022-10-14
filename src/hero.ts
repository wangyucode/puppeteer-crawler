import axios from "axios";
import * as dotenv from "dotenv";
import { forIn } from "lodash";
import { MongoHeroDetail } from "./types";
import { login, uploadHero } from "./uploader";
import { clearStory, convertImageUrl, getBehaviorName, getDispellableName, getEffectsName, getImmunityName, getSuitableFloat, getTalentString, getValue, joinSlash, removeHtmlTag, replaceValue, sleep } from "./utils";

async function main() {
    const listUrl = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2RhdGFmZWVkL2hlcm9MaXN0P3Rhc2s9aGVyb2xpc3Q=', 'base64').toString('utf-8');
    console.log("listUrl->", listUrl);
    const IS_PROD = process.env.ENV === 'prod';
    try {
        const res = await axios.get(listUrl);
        const heroes = res.data.result.heroes;
        console.log("heroes->", heroes.length);
        const detailUrl = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2RhdGFmZWVkL2hlcm8/aGVyb19pZD0=', 'base64').toString('utf-8');
        if (IS_PROD) await login();
        for (const h of heroes) {
            console.log("detailUrl->", detailUrl + h.id);
            const res_d = await axios.get(detailUrl + h.id);
            const res_h = res_d.data.result.heroes;

            const result: MongoHeroDetail | any = {
                id: res_h.id,
                name: res_h.name_loc,
                complexity: ['','简单','中等','复杂'][res_h.complexity],
                eng: res_h.name_english_loc,
                type: ['力量', '敏捷', '智力'][res_h.primary_attr],
                story: clearStory(res_h.bio_loc),
                strengthStart: res_h.str_base,
                strengthGrow: getSuitableFloat(res_h.str_gain),
                agilityStart: res_h.agi_base,
                agilityGrow: getSuitableFloat(res_h.agi_gain),
                intelligenceStart: res_h.int_base,
                intelligenceGrow: getSuitableFloat(res_h.int_gain),
                attackType: res_h.attack_capability === 1 ? '近战' : "远程",
                attackPower: res_h.damage_min + "-" + res_h.damage_max,
                attackRate: getSuitableFloat(res_h.attack_rate),
                attackRange: res_h.attack_range,
                armor: getSuitableFloat(res_h.armor),
                magicResistance: res_h.magic_resistance + "%",
                speed: res_h.movement_speed,
                img: convertImageUrl(res_h.index_img),
                projectileSpeed: res_h.projectile_speed,
                turnRate: getSuitableFloat(res_h.turn_rate),
                sightDay: res_h.sight_range_day,
                sightNight: res_h.sight_range_night,
                health: res_h.max_health,
                healthRegen: getSuitableFloat(res_h.health_regen),
                mana: res_h.max_mana,
                manaRegen: getSuitableFloat(res_h.mana_regen),
                abilities: []
            }

            let num = 0;
            for (const a of res_h.abilities) {
                const ability = {
                    name: a.name_loc,
                    imageUrl: convertImageUrl(a.img),
                    description: replaceValue(removeHtmlTag(a.desc_loc), a.special_values),
                    annotation: a.lore_loc,
                    magicConsumption: joinSlash(a.mana_costs),
                    coolDown: joinSlash(a.cooldowns),
                    tips: a.notes_loc.map(v => replaceValue(v, a.special_values)).join("\n"),
                    shard: a.shard_loc,
                    scepter: replaceValue(a.scepter_loc, a.special_values),
                    behavior: getBehaviorName(a.behavior),
                    dispellable: getDispellableName(a.dispellable),
                    immunity: getImmunityName(a.immunity),
                    effect: getEffectsName(a.target_team + "," + a.target_type),
                    damage: ["", "物理", "魔法", "纯粹", "纯粹"][a.damage],
                    num,
                    attributes: {}
                }
                for (const v of a.special_values) {
                    let key = removeHtmlTag(v.heading_loc) || v.name;
                    let value = getValue(v);
                    if (key === 'AbilityManaCost') continue;
                    if (key === 'AbilityCooldown') continue;
                    if (key === 'AbilityCastPoint') continue;
                    if (key === 'AbilityCastRange') {
                        if (value === '0') continue;
                        key = '作用范围';
                    }
                    if (key === 'AbilityChannelTime') {
                        if (value === '0') continue;
                        key = '吟唱时间';
                    }
                    if (key === 'AbilityCharges') {
                        if (value === '0') continue;
                        key = '充能';
                    }
                    if (key === 'AbilityChargeRestoreTime') {
                        if (value === '0') continue;
                        key = '充能时间'
                    }
                    if (key === 'AbilityDuration') {
                        if (value === '0') continue;
                        key = '持续时间'
                    }
                    if (ability.attributes[key] === undefined) ability.attributes[key] = value;
                }

                num++;
                result.abilities.push(ability);
            }

            result.talent10Right = getTalentString(res_h.talents[0]);
            result.talent10Left = getTalentString(res_h.talents[1]);
            result.talent15Right = getTalentString(res_h.talents[2]);
            result.talent15Left = getTalentString(res_h.talents[3]);
            result.talent20Right = getTalentString(res_h.talents[4]);
            result.talent20Left = getTalentString(res_h.talents[5]);
            result.talent25Right = getTalentString(res_h.talents[6]);
            result.talent25Left = getTalentString(res_h.talents[7]);


            const isDifferent = await isDifferentFromServer(result);
            console.log(`${result.name} ${isDifferent ? '有不同！':'一样'}`);
            if (IS_PROD && isDifferent) await uploadHero(result);
            await sleep(1000);
        }
    } catch (e) {
        console.error("crawler heros error-->", e);
        process.exit(1);
    }
}

async function isDifferentFromServer(hero: MongoHeroDetail): Promise<boolean> {
    console.log("正在比较->", hero.name);
    const serverHero = (await axios.get(`https://wycode.cn/node/dota/heroes/${encodeURIComponent(hero.name)}`)).data.payload;

    let heroHasDifference = false;
    let abilitiesHasDifference = false;
    forIn(serverHero, (value, key) => {
        if (key === '_id') return;
        if (key === 'otherName') return;
        if (key === 'icon') return;
        const heroValue = hero[key];

        if (key !== 'abilities') {
            // hero
            if (value !== heroValue) {
                heroHasDifference = true;
                console.log(`英雄属性 ${key} from: ${value} to: ${heroValue}`);
                return;
            };
        } else {
            // ability
            if (value.length !== hero.abilities.length) {
                abilitiesHasDifference = true;
            } else {
                for (let i = 0; i < value.length; i++) {
                    const serverAbility = value[i];
                    const ability = hero.abilities[i];

                    if (ability.name !== serverAbility.name) {
                        console.log(`技能名称不同 from: ${serverAbility.name} to ${ability.name}`);
                        abilitiesHasDifference = true;
                        break;
                    }

                    forIn(serverAbility, (a_value, a_key) => {
                        if (a_key !== 'attributes') {
                            if (a_value !== ability[a_key]) {
                                abilitiesHasDifference = true;
                                console.log(`技能 ${ability.name} 主要属性 ${a_key} from: ${a_value} to: ${ability[a_key]}`);
                                return;
                            }
                        } else {
                            // attributes
                            forIn(ability.attributes, (attr_value, attr_key) => {
                                if (attr_value !== serverAbility.attributes[attr_key]) {
                                    console.log(`技能 ${ability.name} 其它属性 ${attr_key} from: ${serverAbility.attributes[attr_key]} to: ${attr_value}`);
                                    abilitiesHasDifference = true;
                                }
                            });
                        }

                    });
                }
            }
        }

    });
    return heroHasDifference || abilitiesHasDifference;
}

axios.defaults.timeout = 30000;
dotenv.config();
main();
