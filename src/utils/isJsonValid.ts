export const isJsonValid = (json: string): boolean => {
    let result = false;
    try {
        JSON.parse(json);
        result = true;
    } catch (e) {
        result = false;
    } finally {
        return result;
    }
};
