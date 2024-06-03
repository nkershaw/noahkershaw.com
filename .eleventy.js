module.exports = function(eleventyConfig) {
    // Copy the `assets` folder to the `public` directory
    eleventyConfig.addPassthroughCopy("src/assets");

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};
