module.exports = () => {
    const hero = {};
    // name: '凤凰',
    hero.name = document.querySelector("div.hero_info > div.hero_name").innerText.trim();

    // attackType: '远程'
    hero.attackType = document.querySelector("div.hero_info > ul > li:nth-child(1) > p > span").innerText;

    // otherName: '凤凰',
    hero.otherName = document.querySelector("div.hero_info > ul > li:nth-child(4) > p").innerText;

    // story: '永世的黑暗中'
    hero.story = document.querySelector(".story_box").innerText;

    // strengthStart: 23,
    // strengthGrow: '3.7',
    const strength_element = document.querySelector("div.property_box > ul > li:nth-child(1)");
    const strength_str = strength_element.innerText;
    const strength_split = strength_str.split("+");
    hero.strengthStart = Number.parseInt(strength_split[0].trim());
    hero.strengthGrow = strength_split[1].trim();

    // agilityStart: 12,
    // agilityGrow: '1.3',
    const agility_element = document.querySelector("div.property_box > ul > li:nth-child(2)");
    const agility_str = agility_element.innerText;
    const agility_split = agility_str.split("+");
    hero.agilityStart = Number.parseInt(agility_split[0].trim());
    hero.agilityGrow = agility_split[1].trim();
    // intelligenceStart: 18,
    // intelligenceGrow: '1.8',
    const intelligence_element = document.querySelector("div.property_box > ul > li:nth-child(3)");
    const intelligence_str = intelligence_element.innerText;
    const intelligence_split = intelligence_str.split("+");
    hero.intelligenceStart = Number.parseInt(intelligence_split[0].trim());
    hero.intelligenceGrow = intelligence_split[1].trim();

    // attackPower: 31,
    hero.attackPower = Number.parseInt(document.querySelector("div.property_box > ul > li:nth-child(4)").innerText);

    // attackSpeed: 100,
    hero.attackSpeed = Number.parseInt(document.querySelector("div.property_box > ul > li:nth-child(4) > div.pop_box > p > span:nth-child(1)").innerText);

    // TODO attack_distance: 100,
    // hero.attackDistance = Number.parseInt(document.querySelector("div.property_box > ul > li:nth-child(4) > div.pop_box > p > span:nth-child(5)").innerText);

    // armor: 0,
    hero.armor = Number.parseInt(document.querySelector("div.property_box > ul > li:nth-child(5)").innerText);

    // speed: 280,
    hero.speed = Number.parseInt(document.querySelector("div.property_box > ul > li:nth-child(6)").innerText);

    // talent25Left: '+2% 烈日炙烤最大生命值伤害',
    // talent25Right: '+3 超新星可被攻击次数',
    hero.talent25Left = document.querySelector("ul.talent_ul > li:nth-child(1) > div:nth-child(1)").innerText;
    hero.talent25Right = document.querySelector("ul.talent_ul > li:nth-child(1) > div:nth-child(3)").innerText;

    // talent20Left: '+1.25秒 超新星眩晕',
    // talent20Right: '+1400 凤凰冲击施法距离',
    hero.talent25Left = document.querySelector("ul.talent_ul > li:nth-child(2) > div:nth-child(1)").innerText;
    hero.talent20Right = document.querySelector("ul.talent_ul > li:nth-child(2) > div:nth-child(3)").innerText;

    // talent15Left: '+500 生命',
    // talent15Right: '+50 烈火精灵每秒伤害',
    hero.talent15Left = document.querySelector("ul.talent_ul > li:nth-child(3) > div:nth-child(1)").innerText;
    hero.talent15Right = document.querySelector("ul.talent_ul > li:nth-child(3) > div:nth-child(3)").innerText;

    // talent10Left: '+8% 技能增强',
    // talent10Right: '+18% 凤凰冲击减速',
    hero.talent10Left = document.querySelector("ul.talent_ul > li:nth-child(4) > div:nth-child(1)").innerText;
    hero.talent10Right = document.querySelector("ul.talent_ul > li:nth-child(4) > div:nth-child(3)").innerText;

    hero.abilities = [];
    const skill_elements = document.querySelectorAll("#focus_dl > dd");
    skill_elements.forEach(skill_element => {

            const skill = {};

            // name: '凤凰冲击',
            skill.name = skill_element.querySelector("div.skill_wrap > div > p > span").innerText;

            if (!skill.name) {
                return;
            }

            // TODO  remove heroName: '凤凰',

            // imageUrl: '//phoenix_icarus_dive_hp1.png',
            skill.imageUrl = skill_element.querySelector("div.skill_wrap > img").src;


            // annotation: '尽管没少在宇宙虚空之间遨游，但在大气里振翅高飞还是有不同的快感。',
            skill.annotation = skill_element.querySelector("div.skill_bot").innerText;

            // description: '凤凰向目标方向进行圆弧状飞行，飞行距离固定，对沿途的敌人造成持续伤害并减缓其移动速度，然后返回初始位置。飞行过程中如果施放超新星将停止飞行。',
            skill.description = skill_element.querySelector("div.skill_wrap > div > p").innerText.trim().split("\n")[1];

            if (skill.description) skill.description = skill.description.trim();

            // magicConsumption: '0',
            skill.magicConsumption = skill_element.querySelector("div.skill_wrap > div > div.xiaohao_wrap > div.icon_xh").innerText.split("：")[1];

            // coolDown: '36',
            skill.coolDown = skill_element.querySelector("div.skill_wrap > div > div.xiaohao_wrap > div.icon_lq").innerText.split("：")[1];

            // tips: '凤凰冲击的飞行时间为2秒，可以在飞行途中再次施放来终止飞行。',
            const skill_green = skill_element.querySelector("div.skill_wrap > div > p.color_green");
            skill.tips = skill_green ? skill_green.innerText.trim() : "";


            // attributes: {
            //     '技能': '点目标',
            //     '移动速度减缓': '19%/22%/25%/28%',
            //     '烧灼持续时间': '4',
            //     '每秒烧灼伤害': '10/30/50/70',
            //     '生命值消耗': '15%',
            //     '冲击长度': '1400',
            //     '伤害类型': '魔法'
            // },
            skill.attributes = {};
            const attribute_elements = skill_element.querySelectorAll("div.skill_wrap > div > ul > li");
            attribute_elements.forEach(attribute => {
                let attribute_split = attribute.innerText.split(":");
                if (attribute_split.length < 2) {
                    attribute_split = attribute.innerText.split("：");
                }
                if (attribute_split.length < 2) {
                    attribute_split = attribute.innerText.split("；");
                }
                const key = attribute_split[0];
                let value = attribute_split[1].trim();
                if (value.toLowerCase() === 'physical') {
                    value = "物理"
                } else if (value.toLowerCase() === 'magical') {
                    value = '魔法';
                } else if (value.toLowerCase() === 'pure') {
                    value = '纯粹';
                }
                skill.attributes[key] = value;
            });

            // num: 1
            skill.num = Number.parseInt(skill_element.getAttribute('jnxs'));

            hero.abilities.push(skill);
        }
    );
    console.log("hero-->", hero);
    return hero;
}
;
