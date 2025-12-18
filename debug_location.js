
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./src/data/locationData.json', 'utf8'));

const provinceKey = "बागमती प्रदेश "; // With space as seen in file
const province = data[provinceKey];

console.log(`Province '${provinceKey}' exists:`, !!province);

if (province) {
    const districts = Object.keys(province);
    console.log("Districts:", districts);

    const districtKey = "काठमाण्डौ";
    const district = province[districtKey];
    console.log(`District '${districtKey}' exists:`, !!district);

    if (district) {
        const municipalities = Object.keys(district);
        console.log("Municipalities:", municipalities);

        const muniKey = "काठमाण्डौ महानगरपालिका";
        const wards = district[muniKey];
        console.log(`Municipality '${muniKey}' exists:`, !!wards);
        console.log("Wards:", wards);
    } else {
        // Try to find if it has a different name/space
        console.log("Did not find 'काठमाण्डौ'. available:", districts.find(d => d.includes("काठ")));
    }
} else {
    console.log("Available provinces:", Object.keys(data));
}
