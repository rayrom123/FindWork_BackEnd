const { OpenAI } = require("openai");

// To authenticate with the model you will need to generate a personal access token (PAT) in your GitHub settings. 
// Create your PAT token by following instructions here: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
const token = process.env["GITHUB_TOKEN"];

async function getChatGptResponse(prompt) {

    const client = new OpenAI({
        baseURL: "https://models.github.ai/inference",
        apiKey: token
    });

    const response = await client.chat.completions.create({
        messages: [
            { role: "user", content: prompt },
        ],
        model: "openai/gpt-4o",
        temperature: 1,
        max_tokens: 4096,
        top_p: 1
    });

    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}


module.exports = { getChatGptResponse };



