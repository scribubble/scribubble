const url = ":4000";

export default (config, env, helpers) => {
    config.plugins.push(
        new helpers.webpack.DefinePlugin({
            'process.env.SERVER_URL': JSON.stringify(url)
        }),
    );
};