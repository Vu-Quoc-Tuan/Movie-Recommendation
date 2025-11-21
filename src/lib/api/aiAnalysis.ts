import { embeddingAPI, searchSimilar } from "./apiCharactor.ts";


async function charactorAnalyze(moodText:string): Promise<any> {
    let embeddingInput = await embeddingAPI(moodText);
    if (!embeddingInput) {
        throw new Error("Failed to get embedding from API");
    }
    const movies = await searchSimilar(embeddingInput.embedding, 10);
    return movies;
}

export default charactorAnalyze;