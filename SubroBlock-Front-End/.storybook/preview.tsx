import { SessionProvider } from 'next-auth/react';
import { Preview } from "@storybook/react";

const withGlobalStylesAndSession = (Story, context) => {
  return (
      <SessionProvider>
          <Story {...context} />
      </SessionProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        colorScheme: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withGlobalStylesAndSession,
  ],
};

export default preview;
