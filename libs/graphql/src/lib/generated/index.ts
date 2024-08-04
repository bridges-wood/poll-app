import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

/** Arguments to add a new endpoint to the gateway. Intended to be compatible with [Hashicorp Consul](https://developer.hashicorp.com/consul). */
export type AddEndpointArgs = {
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['input'];
  /** The URL of the service, e.g. "http://localhost:3000/graphql". Must be a valid URL. */
  url: Scalars['String']['input'];
};

export type AddEndpointResult = {
  __typename?: 'AddEndpointResult';
  /** The endpoint that was added */
  endpoint?: Maybe<Endpoint>;
  /** Whether the endpoint was added successfully */
  success: Scalars['Boolean']['output'];
};

export type AuthResult = {
  __typename?: 'AuthResult';
  /** The token containing the user ID and the authentication method. */
  token: Scalars['String']['output'];
};

/** Stub comment */
export type Comment = {
  __typename?: 'Comment';
  /** The ID of the comment as it is stored in Firebase */
  id: Scalars['ID']['output'];
};

export type CommentInput = {
  /** The ID of the comment as it is stored in Firebase */
  id: Scalars['ID']['input'];
};

export enum ContentType {
  MultipleChoice = 'MULTIPLE_CHOICE'
}

export type CreatePostArgs = {
  /** The caption of the post */
  caption: Scalars['String']['input'];
  /** The content of the post */
  content: PostContentInput;
};

export type CreateUserArgs = {
  /** The name of the user as is displayed to others */
  displayName: Scalars['String']['input'];
  /** The email address of the user */
  email: Scalars['String']['input'];
  /** The URL of the user's profile picture */
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};

/** A service accessible by the API Gateway */
export type Endpoint = {
  __typename?: 'Endpoint';
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['output'];
  /** The URL of the service, e.g. "http://localhost:3000/graphql". Must be a valid URL. */
  url: Scalars['String']['output'];
};

export type IPostContent = {
  /** The type of content */
  type: ContentType;
};

/** A response to a post */
export type IPostResponse = {
  /** The author of the response */
  author: User;
  /** The content of the response */
  content: Scalars['String']['output'];
  /** The date and time the response was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the response */
  id: Scalars['String']['output'];
  /** The post that the response relates to */
  post: Post;
  /** The type of content */
  type: ContentType;
  /** The date and time the response was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

/** An endpoint that has been loaded into the API Gateway */
export type LoadedEndpoint = {
  __typename?: 'LoadedEndpoint';
  /** The date and time the endpoint was last loaded */
  lastReload: Scalars['DateTime']['output'];
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['output'];
  /** The GraphQL SDL of the endpoint */
  sdl: Scalars['String']['output'];
  /** The URL of the service, e.g. "http://localhost:3000/graphql". Must be a valid URL. */
  url: Scalars['String']['output'];
};

/** A multiple choice question */
export type MultipleChoiceQuestion = IPostContent & {
  __typename?: 'MultipleChoiceQuestion';
  /** The options for the question */
  options: Array<Scalars['String']['output']>;
  /** The question being asked */
  question: Scalars['String']['output'];
  /** All responses to the question */
  responses: Array<MultipleChoiceResponse>;
  /** The type of content */
  type: ContentType;
  /** The vote totals for each option */
  voteTotals: Array<Scalars['Float']['output']>;
};

export type MultipleChoiceQuestionInput = {
  /** The options for the question */
  options: Array<Scalars['String']['input']>;
  /** The question being asked */
  question: Scalars['String']['input'];
};

/** A response to a multiple choice question */
export type MultipleChoiceResponse = IPostResponse & {
  __typename?: 'MultipleChoiceResponse';
  /** The author of the response */
  author: User;
  /** The content of the response */
  content: Scalars['String']['output'];
  /** The date and time the response was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the response */
  id: Scalars['String']['output'];
  /** The post that the response relates to */
  post: Post;
  /** The index of the option selected */
  selectedOption: Scalars['Float']['output'];
  /** The type of content */
  type: ContentType;
  /** The date and time the response was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add a new endpoint to the gateway */
  addEndpoint: AddEndpointResult;
  /** Create a new post */
  createPost: Post;
  /** Create a new user */
  createUser: User;
  /** Delete a post by id */
  deletePost: Scalars['Boolean']['output'];
  /** Refresh an auth token */
  refreshToken: AuthResult;
  /** Reload the schema of all endpoints loaded by the gateway */
  reloadAllEndpoints: ReloadAllEndpointsResult;
  /** Remove an endpoint from the gateway */
  removeEndpoint: RemoveEndpointResult;
  /** Generate an auth token using email and password */
  signInWithEmailAndPassword: AuthResult;
  /** Generate an auth token using OAuth token */
  signInWithOAuthToken: AuthResult;
  /** Update a post by id */
  updatePost?: Maybe<Post>;
  /** Update a user by id */
  updateUser?: Maybe<User>;
};


export type MutationAddEndpointArgs = {
  args: AddEndpointArgs;
};


export type MutationCreatePostArgs = {
  args: CreatePostArgs;
};


export type MutationCreateUserArgs = {
  args: CreateUserArgs;
  id: Scalars['String']['input'];
};


export type MutationDeletePostArgs = {
  id: Scalars['String']['input'];
};


export type MutationRefreshTokenArgs = {
  token: Scalars['String']['input'];
};


export type MutationRemoveEndpointArgs = {
  name: Scalars['String']['input'];
};


export type MutationSignInWithEmailAndPasswordArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignInWithOAuthTokenArgs = {
  provider: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUpdatePostArgs = {
  args: UpdatePostArgs;
  id: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  args: UpdateUserArgs;
  id: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The total number of items in the connection */
  count: Scalars['Int']['output'];
  /** The cursor to the last item on the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor to the first item one the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** A post */
export type Post = {
  __typename?: 'Post';
  /** The author of the post */
  author: User;
  /** The caption of the post */
  caption: Scalars['String']['output'];
  /** All comments on the post */
  comments: Array<Comment>;
  /** The content of the post */
  content: PostContent;
  /** The date and time the post was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the post as it is stored in Firebase */
  id: Scalars['ID']['output'];
  /** The date and time the post was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type PostConnection = {
  __typename?: 'PostConnection';
  /** Edges connected to this page */
  edges?: Maybe<Array<PostEdge>>;
  /** Information about this page */
  pageInfo: PageInfo;
  /** Total count of items in existence */
  totalCount: Scalars['Int']['output'];
};

export type PostContent = MultipleChoiceQuestion;

export type PostContentInput = {
  multipleChoiceQuestion?: InputMaybe<MultipleChoiceQuestionInput>;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: Post;
};

export type Query = {
  __typename?: 'Query';
  /** Get all endpoints currently loaded by the gateway */
  endpoints: Array<LoadedEndpoint>;
  /** Get the user from the passed authorization header */
  me: User;
  /** Get a post by id */
  post: Post;
  /** Get all posts */
  posts: PostConnection;
  /** Get all posts by id */
  postsByIds: PostConnection;
  /** Get a user by id */
  user: User;
  /** Get all users */
  users: UserConnection;
  /** Ensure that a given token was issued by the application */
  validateToken: Scalars['String']['output'];
};


export type QueryPostArgs = {
  id: Scalars['String']['input'];
};


export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPostsByIdsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids: Array<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryValidateTokenArgs = {
  token: Scalars['String']['input'];
};

export type ReloadAllEndpointsResult = {
  __typename?: 'ReloadAllEndpointsResult';
  /** Whether the endpoints were reloaded successfully */
  success: Scalars['Boolean']['output'];
};

export type RemoveEndpointResult = {
  __typename?: 'RemoveEndpointResult';
  /** Whether the endpoint was removed successfully */
  success: Scalars['Boolean']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to all changes on a post by id */
  postUpdated: Post;
  /** Subscribe to all changes on a user by id */
  userUpdated: User;
};


export type SubscriptionPostUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionUserUpdatedArgs = {
  id: Scalars['String']['input'];
};

export type UpdatePostArgs = {
  /** The caption of the post */
  caption?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Array<CommentInput>>;
};

export type UpdateUserArgs = {
  /** The name of the user as is displayed to others */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The email address of the user */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The user's first name */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** The user's last name */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** The URL of the user's profile picture */
  profilePicture?: InputMaybe<Scalars['String']['input']>;
  /** The roles the user has */
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A user */
export type User = {
  __typename?: 'User';
  /** The date and time the user was created */
  createdAt: Scalars['DateTime']['output'];
  /** The name of the user as is displayed to others */
  displayName: Scalars['String']['output'];
  /** The email address of the user */
  email: Scalars['String']['output'];
  /** The user's first name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** The ID of the user as it is stored in Firebase */
  id: Scalars['ID']['output'];
  /** The user's last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** All posts created by the user */
  posts: PostConnection;
  /** The URL of the user's profile picture */
  profilePicture?: Maybe<Scalars['String']['output']>;
  /** The roles the user has */
  roles: Array<Scalars['String']['output']>;
  /** The date and time the user was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  /** Edges connected to this page */
  edges?: Maybe<Array<UserEdge>>;
  /** Information about this page */
  pageInfo: PageInfo;
  /** Total count of items in existence */
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: User;
};

export type AuthDataFragment = { __typename?: 'User', id: string, roles: Array<string> };

export type CreateUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
  args: CreateUserArgs;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename: 'User', id: string, displayName: string, email: string } };

export type DeRegisterServiceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type DeRegisterServiceMutation = { __typename?: 'Mutation', removeEndpoint: { __typename?: 'RemoveEndpointResult', success: boolean } };

export type OAuthSignInMutationVariables = Exact<{
  token: Scalars['String']['input'];
  provider: Scalars['String']['input'];
}>;


export type OAuthSignInMutation = { __typename?: 'Mutation', signInWithOAuthToken: { __typename?: 'AuthResult', token: string } };

export type RefreshTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthResult', token: string } };

export type RegisterServiceMutationVariables = Exact<{
  args: AddEndpointArgs;
}>;


export type RegisterServiceMutation = { __typename?: 'Mutation', addEndpoint: { __typename?: 'AddEndpointResult', success: boolean, endpoint?: { __typename?: 'Endpoint', name: string } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
  args: UpdateUserArgs;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename: 'User', id: string, updatedAt: any } | null };

export type ProfileDataFragment = { __typename?: 'User', email: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null };

export type FetchProfileDataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchProfileDataQuery = { __typename?: 'Query', me: { __typename: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null } };

export type ValidateTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type ValidateTokenQuery = { __typename?: 'Query', validateToken: string };

export const AuthDataFragmentDoc = gql`
    fragment AuthData on User {
  id
  roles
}
    `;
export const ProfileDataFragmentDoc = gql`
    fragment ProfileData on User {
  email
  displayName
  firstName
  lastName
  profilePicture
}
    `;
export const CreateUserDocument = gql`
    mutation CreateUser($id: String!, $args: CreateUserArgs!) {
  createUser(id: $id, args: $args) {
    __typename
    id
    displayName
    email
  }
}
    `;
export const DeRegisterServiceDocument = gql`
    mutation DeRegisterService($name: String!) {
  removeEndpoint(name: $name) {
    success
  }
}
    `;
export const OAuthSignInDocument = gql`
    mutation OAuthSignIn($token: String!, $provider: String!) {
  signInWithOAuthToken(token: $token, provider: $provider) {
    token
  }
}
    `;
export const RefreshTokenDocument = gql`
    mutation RefreshToken($token: String!) {
  refreshToken(token: $token) {
    token
  }
}
    `;
export const RegisterServiceDocument = gql`
    mutation RegisterService($args: AddEndpointArgs!) {
  addEndpoint(args: $args) {
    success
    endpoint {
      name
    }
  }
}
    `;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: String!, $args: UpdateUserArgs!) {
  updateUser(id: $id, args: $args) {
    __typename
    id
    updatedAt
  }
}
    `;
export const FetchProfileDataDocument = gql`
    query FetchProfileData {
  me {
    __typename
    id
    ...ProfileData
  }
}
    ${ProfileDataFragmentDoc}`;
export const ValidateTokenDocument = gql`
    query ValidateToken($token: String!) {
  validateToken(token: $token)
}
    `;