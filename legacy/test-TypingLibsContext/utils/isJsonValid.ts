export const isJsonValid = (json: string): boolean => {
    let result = false;
    try {
        JSON.parse(json);
        result = true;
    } catch (e) {
        result = false;
    } finally {
        console.log(`[isJsonValid] result: ${result}`);
        
        return result;
    }
};
