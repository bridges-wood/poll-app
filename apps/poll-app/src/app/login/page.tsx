import { GoogleButton } from '@poll-app/components/buttons';
import {
  EnvelopeClosedIcon,
  EyeNoneIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import {
  Heading,
  Text,
  TextFieldInput,
  TextFieldRoot,
  TextFieldSlot,
} from '@radix-ui/themes';

const Login = () => {
  return (
    <div className="flex flex-col items-center max-w-md">
      <Heading size="8" className="mb-8">
        Log In
      </Heading>
      <GoogleButton shape="sq" variant="ctn" />
      <Text className="mt-2 mb-2">or</Text>
      <div id="login-form" className="w-full">
        <TextFieldRoot className="w-full">
          <TextFieldSlot>
            <EnvelopeClosedIcon />
          </TextFieldSlot>
          <TextFieldInput placeholder="Email" type="email" disabled />
        </TextFieldRoot>
        <TextFieldRoot className="w-full">
          <TextFieldSlot>
            <LockClosedIcon />
          </TextFieldSlot>
          <TextFieldInput placeholder="Password" type="password" disabled />
          <TextFieldSlot>
            <EyeNoneIcon />
          </TextFieldSlot>
        </TextFieldRoot>
      </div>
    </div>
  );
};

export default Login;
