'use client';
import { Button } from '@org/ui-kit/ui/button';
import { CheckIcon, ClipboardCopyIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useState } from 'react';
import { toast } from 'sonner';

export type DevToastProps = {
  token: string;
  id: string | number;
};

const DevToast: FC<DevToastProps> = ({ token, id }) => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="border-thin border-border-success-emphasis shadow-resting-md flex w-80 items-baseline justify-between gap-2 rounded-md p-4">
      <span>Copy token to clipboard</span>
      <Button
        variant="outline"
        size="icon"
        onClick={(event) => {
          event.preventDefault();
          navigator.clipboard.writeText(token);
          setDismissed(true);
          setTimeout(() => {
            toast.dismiss(id);
          }, 700);
        }}
      >
        <AnimatePresence>
          {dismissed && (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <CheckIcon />
            </motion.div>
          )}
          {!dismissed && (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <ClipboardCopyIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};

export default DevToast;
