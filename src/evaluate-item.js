module.exports = () => {
    const items = [];

    const shopColumns = document.querySelectorAll("div.shopColumn");

    let i = 0;
    for (shopColumn of shopColumns) {
        // cname: '升级物品',
        let cname = "基础分类";
        if (i > 4) {
            cname = "合成分类";
        }
        // type: '武器',
        const type = shopColumn.querySelector('h4').innerText;

        const itemElements = shopColumn.querySelectorAll('.itemIconWithTooltip');

        for (let itemElement of itemElements) {
            const item = {};
            item.cname = cname;
            item.type = type;

            // _id: 'armlet',
            item.key = itemElement.getAttribute('itemname');
            // img: 'http:///armlet_lg.png?3',
            item.img = itemElement.querySelector('img').src;

            ShowTooltip('item', itemElement, true);

            // name: '莫尔迪基安的臂章',
            item.name = document.querySelector('#iconTooltip > div.itemName').innerText;
            // cost: 2380,
            item.cost = Number.parseInt(document.querySelector('#iconTooltip > div.goldCost').innerText);
            // lore: '能让你成为野兽的武器，持有者牺牲自己的生命能量来获得巨大力量。',
            item.lore = document.querySelector('#iconTooltip > div.lore').innerText;
            // mc: '0',
            item.mc = '0';
            const mc_e = document.querySelector('#iconTooltip > div.cooldownMana > div.mana');
            if (mc_e) item.mc = mc_e.innerText;
            // cd: 0,
            item.cd = '0';
            const cooldown_e = document.querySelector('#iconTooltip > div.cooldownMana');
            if (cooldown_e && cooldown_e.childNodes.length) {
                let hasCoolDown = false;
                for (let node of cooldown_e.childNodes) {
                    if (hasCoolDown) {
                        if (node.nodeName === '#text') {
                            item.cd = node.nodeValue;
                        }
                        break;
                    }
                    if (node.className === 'cooldownImg') {
                        hasCoolDown = true;
                    }
                }
            }
            // desc: {
            // '激活：邪恶之力': '激活后邪恶之力将提升31点攻击力、25点力量和4点护甲，但每秒失去54点生命值。\n 开启邪恶之力后生命流失并不会导致死亡，关闭邪恶之力后力量降低也不会导致死亡。'
            // },
            item.desc = {};
            let desc_key = "";
            let desc_value = "";
            for (let node of document.querySelector('#iconTooltip > div.description').childNodes) {
                if (node.nodeName === 'H1') {
                    if (desc_key) {
                        item.desc[desc_key] = desc_value;
                        desc_value = "";
                    }
                    desc_key = node.innerText;

                } else if (node.nodeName === '#text') {
                    if (desc_value) desc_value += "\n";
                    desc_value += node.nodeValue;
                }
            }

            if (desc_key) item.desc[desc_key] = desc_value;

            // notes: '力量值的变化会影响血量上限和当前生命值，但是不会致死。\n力量的增加将在0.6秒内完成。\n开启或关闭邪恶之力并不会打断持续施法。',
            const note_e = document.querySelector('#iconTooltip > div.notes');
            item.notes = note_e ? note_e.innerText : "";

            // attrs: {
            // '护甲': '5',
            // '攻击力': '15',
            // '攻击速度': '25',
            // '生命恢复': '4'
            // }
            item.attrs = {};
            for (let node of document.querySelectorAll('#iconTooltip > div.attribs > p.pop_skill_p')) {
                const key_value = node.innerText.split("：");
                item.attrs[key_value[0]] = key_value[1];
            }
            try {
                showItemInFullBox(item._id, 0);
            } catch (e) {
                console.error(item.name, e);
                items.push(item);
                continue;
            }


            // components: [
            // 'helm_of_iron_will',
            // 'gloves',
            // 'blades_of_attack'
            // ],
            item.components = [];
            for (let node of document.querySelectorAll('#fullItemRecipeItems > div.recipeComponent')) {
                let component = node.getAttribute('itemname');
                if (component && component !== 'recipe"') item.components.push(node.getAttribute('itemname'));
            }
            items.push(item);
        }
        i++;
    }
    console.log(items);
    return items;
};
