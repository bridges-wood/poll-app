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
  DateTime: { input: Date; output: string; }
};

/** Arguments to add a new endpoint to the gateway. Intended to be compatible with [Hashicorp Consul](https://developer.hashicorp.com/consul). */
export type AddEndpointArgs = {
  /** A hash denoting the version of the service. Must be a valid SHA256 hash. */
  hash: Scalars['String']['input'];
  /** The URL of the JWKS endpoint for the service. Must be a valid URL. */
  jwksUri?: InputMaybe<Scalars['String']['input']>;
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['input'];
  /** The root URL of the service, e.g. "http://localhost:3000". Must be a valid URL. */
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

export type CommentInput = {
  /** The ID of the comment as it is stored in Firebase */
  id: Scalars['ID']['input'];
};

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
  /** A hash denoting the version of the service. Must be a valid SHA256 hash. */
  hash: Scalars['String']['output'];
  /** The URL of the JWKS endpoint for the service. Must be a valid URL. */
  jwksUri?: Maybe<Scalars['String']['output']>;
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['output'];
  /** The root URL of the service, e.g. "http://localhost:3000". Must be a valid URL. */
  url: Scalars['String']['output'];
};

/** Filter for endpoints loaded by the gateway. */
export type EndpointFilter = {
  /** Matches `LoadedEndpoint` objects which have specified fields. */
  has?: InputMaybe<Array<LoadedEndpointSearchHas>>;
  /** Filter arguments for objects with the `hash` field. */
  hash?: InputMaybe<StringFieldFilterArgs>;
  /** Filter arguments for objects with the `jwksUri` field. */
  jwksUri?: InputMaybe<StringFieldFilterArgs>;
  /** Filter arguments for objects with the `name` field. */
  name?: InputMaybe<StringFieldFilterArgs>;
  /** Filter arguments for objects with the `sdl` field. */
  sdl?: InputMaybe<StringFieldFilterArgs>;
  /** Filter arguments for objects with the `url` field. */
  url?: InputMaybe<StringFieldFilterArgs>;
};

export type IPostContent = {
  /** The type of content */
  type: PostContentType;
};

/** An endpoint that has been loaded into the API Gateway */
export type LoadedEndpoint = {
  __typename?: 'LoadedEndpoint';
  /** A hash denoting the version of the service. Must be a valid SHA256 hash. */
  hash: Scalars['String']['output'];
  /** The URL of the JWKS endpoint for the service. Must be a valid URL. */
  jwksUri?: Maybe<Scalars['String']['output']>;
  /** The date and time the endpoint was last loaded */
  lastReload: Scalars['DateTime']['output'];
  /** Logical name of the service, e.g. "users-service". Many nodes may share the same logical service name. Use valid DNS label. See [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#page-72) for more details. */
  name: Scalars['String']['output'];
  /** The GraphQL SDL of the endpoint */
  sdl: Scalars['String']['output'];
  /** The root URL of the service, e.g. "http://localhost:3000". Must be a valid URL. */
  url: Scalars['String']['output'];
};

export enum LoadedEndpointSearchHas {
  /** The URL of the JWKS endpoint for the service. Must be a valid URL. */
  JwksUri = 'jwksUri'
}

/** A multiple choice question */
export type MultipleChoiceQuestion = IPostContent & {
  __typename?: 'MultipleChoiceQuestion';
  /** The options for the question */
  options: Array<Scalars['String']['output']>;
  /** The question being asked */
  question: Scalars['String']['output'];
  /** The type of content */
  type: PostContentType;
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
export type MultipleChoiceResponse = Response & {
  __typename?: 'MultipleChoiceResponse';
  /** The author of the response */
  author: User;
  /** The content of the response */
  content?: Maybe<Scalars['String']['output']>;
  /** The date and time the response was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the response */
  id: Scalars['String']['output'];
  /** The post that the response relates to */
  post: Post;
  /** The index of the option selected */
  selectedOption: Scalars['Float']['output'];
  /** The type of content */
  type: PostContentType;
  /** The date and time the response was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type MultipleChoiceResponseInput = {
  /** The content of the response */
  content?: InputMaybe<Scalars['String']['input']>;
  /** The index of the option selected */
  selectedOption: Scalars['Float']['input'];
  /** The type of content */
  type: PostContentType;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add a new endpoint to the gateway */
  addEndpoint: AddEndpointResult;
  /** Create a new post */
  createPost: Post;
  /** Create a response to a post */
  createResponse: Response;
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


export type MutationCreateResponseArgs = {
  args: ResponseInput;
  postId: Scalars['String']['input'];
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
  /** The content of the post */
  content: PostContent;
  /** The date and time the post was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the post as it is stored in Firebase */
  id: Scalars['ID']['output'];
  /** All responses to the post, for the current user */
  myResponses: ResponseConnection;
  /** All responses to the post */
  responses: ResponseConnection;
  /** The date and time the post was last updated */
  updatedAt: Scalars['DateTime']['output'];
};


/** A post */
export type PostMyResponsesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
};


/** A post */
export type PostResponsesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
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

/** The type of content for a post */
export enum PostContentType {
  /** A multiple choice question */
  MultipleChoice = 'MULTIPLE_CHOICE'
}

export type PostEdge = {
  __typename?: 'PostEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: Post;
};

export type Query = {
  __typename?: 'Query';
  /** Get a user by id */
  _userById: User;
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
  validateToken: ValidateTokenResult;
};


export type Query_UserByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryEndpointsArgs = {
  filter?: InputMaybe<EndpointFilter>;
};


export type QueryPostArgs = {
  id: Scalars['String']['input'];
};


export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPostsByIdsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids: Array<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
};


export type QueryValidateTokenArgs = {
  token: Scalars['String']['input'];
};

export type ReloadAllEndpointsResult = {
  __typename?: 'ReloadAllEndpointsResult';
  /** The currently loaded endpoints */
  loadedEndpoints: Array<LoadedEndpoint>;
  /** Whether the endpoints were reloaded successfully */
  success: Scalars['Boolean']['output'];
};

export type RemoveEndpointResult = {
  __typename?: 'RemoveEndpointResult';
  /** Whether the endpoint was removed successfully */
  success: Scalars['Boolean']['output'];
};

/** A response to a post */
export type Response = {
  /** The author of the response */
  author: User;
  /** The content of the response */
  content?: Maybe<Scalars['String']['output']>;
  /** The date and time the response was created */
  createdAt: Scalars['DateTime']['output'];
  /** The ID of the response */
  id: Scalars['String']['output'];
  /** The post that the response relates to */
  post: Post;
  /** The type of content */
  type: PostContentType;
  /** The date and time the response was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type ResponseConnection = {
  __typename?: 'ResponseConnection';
  /** Edges connected to this page */
  edges?: Maybe<Array<ResponseEdge>>;
  /** Information about this page */
  pageInfo: PageInfo;
  /** Total count of items in existence */
  totalCount: Scalars['Int']['output'];
};

export type ResponseEdge = {
  __typename?: 'ResponseEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: Response;
};

export type ResponseInput = {
  multipleChoiceResponse?: InputMaybe<MultipleChoiceResponseInput>;
};

/** Filter for string fields */
export type StringFieldFilterArgs = {
  /** Matches exactly this value */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Matches any of these values */
  in?: InputMaybe<Array<Scalars['String']['input']>>;
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


/** A user */
export type UserPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
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

export type ValidateTokenResult = {
  __typename?: 'ValidateTokenResult';
  /** The ID of the user as it is stored in Firebase */
  id: Scalars['ID']['output'];
  /** The roles the user has */
  roles: Array<Scalars['String']['output']>;
};

export type AuthDataFragment = { __typename?: 'User', id: string, roles: Array<string> };

export type FeedMultipleChoiceQuestionFragment = { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> };

export type FeedResponseFragment = { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } };

export type FeedPostFragment = { __typename?: 'Post', id: string, caption: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string }, content: { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> }, responses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null }, myResponses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null } };

export type ProfileDataFragment = { __typename?: 'User', displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string };

export type MultipleChoiceResponseFragmentFragment = { __typename?: 'MultipleChoiceResponse', selectedOption: number };

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


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename: 'User', id: string, updatedAt: string } | null };

export type VoteOnMultipleChoicePostMutationVariables = Exact<{
  postId: Scalars['String']['input'];
  response: MultipleChoiceResponseInput;
}>;


export type VoteOnMultipleChoicePostMutation = { __typename?: 'Mutation', createResponse: { __typename?: 'MultipleChoiceResponse', id: string, selectedOption: number } };

export type FetchAuthDataQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type FetchAuthDataQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, roles: Array<string> } };

export type FindEndpointsWithJwksQueryVariables = Exact<{ [key: string]: never; }>;


export type FindEndpointsWithJwksQuery = { __typename?: 'Query', endpoints: Array<{ __typename?: 'LoadedEndpoint', jwksUri?: string | null }> };

export type CurrentUserProfileDataQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserProfileDataQuery = { __typename?: 'Query', me: { __typename: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } };

export type FetchPostQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type FetchPostQuery = { __typename?: 'Query', post: { __typename?: 'Post', id: string, caption: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string }, content: { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> }, responses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null }, myResponses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null } } };

export type FetchPostsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
}>;


export type FetchPostsQuery = { __typename?: 'Query', posts: { __typename?: 'PostConnection', edges?: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: string, caption: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string }, content: { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> }, responses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null }, myResponses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null } } }> | null, pageInfo: { __typename?: 'PageInfo', hasPreviousPage: boolean, hasNextPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type FetchProfileDataQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type FetchProfileDataQuery = { __typename?: 'Query', user: { __typename: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string, posts: { __typename?: 'PostConnection', edges?: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: string, caption: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string }, content: { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> }, responses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null }, myResponses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null } } }> | null } } };

export type FetchMyProfileDataQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchMyProfileDataQuery = { __typename?: 'Query', me: { __typename: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string, posts: { __typename?: 'PostConnection', edges?: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: string, caption: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string }, content: { __typename?: 'MultipleChoiceQuestion', type: PostContentType, question: string, options: Array<string>, voteTotals: Array<number> }, responses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null }, myResponses: { __typename?: 'ResponseConnection', edges?: Array<{ __typename?: 'ResponseEdge', node: { __typename?: 'MultipleChoiceResponse', id: string, type: PostContentType, content?: string | null, createdAt: string, selectedOption: number, post: { __typename?: 'Post', id: string }, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, profilePicture?: string | null, createdAt: string } } }> | null } } }> | null } } };

export type ValidateTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type ValidateTokenQuery = { __typename?: 'Query', validateToken: { __typename?: 'ValidateTokenResult', id: string, roles: Array<string> } };

export const AuthDataFragmentDoc = gql`
    fragment AuthData on User {
  id
  roles
}
    `;
export const ProfileDataFragmentDoc = gql`
    fragment ProfileData on User {
  displayName
  firstName
  lastName
  profilePicture
  createdAt
}
    `;
export const FeedMultipleChoiceQuestionFragmentDoc = gql`
    fragment FeedMultipleChoiceQuestion on MultipleChoiceQuestion {
  type
  question
  options
  voteTotals
}
    `;
export const MultipleChoiceResponseFragmentFragmentDoc = gql`
    fragment MultipleChoiceResponseFragment on MultipleChoiceResponse {
  selectedOption
}
    `;
export const FeedResponseFragmentDoc = gql`
    fragment FeedResponse on Response {
  id
  type
  ...MultipleChoiceResponseFragment
  post {
    id
  }
  author {
    id
    ...ProfileData
  }
  content
  createdAt
}
    ${MultipleChoiceResponseFragmentFragmentDoc}
${ProfileDataFragmentDoc}`;
export const FeedPostFragmentDoc = gql`
    fragment FeedPost on Post {
  id
  author {
    id
    ...ProfileData
  }
  content {
    ...FeedMultipleChoiceQuestion
  }
  responses(last: 3, orderBy: "createdAt") {
    edges {
      node {
        ...FeedResponse
      }
    }
  }
  myResponses(first: 1) {
    edges {
      node {
        ...FeedResponse
      }
    }
  }
  caption
  createdAt
  updatedAt
}
    ${ProfileDataFragmentDoc}
${FeedMultipleChoiceQuestionFragmentDoc}
${FeedResponseFragmentDoc}`;
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
export const VoteOnMultipleChoicePostDocument = gql`
    mutation VoteOnMultipleChoicePost($postId: String!, $response: MultipleChoiceResponseInput!) {
  createResponse(postId: $postId, args: {multipleChoiceResponse: $response}) {
    id
    ...MultipleChoiceResponseFragment
  }
}
    ${MultipleChoiceResponseFragmentFragmentDoc}`;
export const FetchAuthDataDocument = gql`
    query FetchAuthData($id: String!) {
  user(id: $id) {
    id
    roles
  }
}
    `;
export const FindEndpointsWithJwksDocument = gql`
    query FindEndpointsWithJWKS {
  endpoints(filter: {has: jwksUri}) {
    jwksUri
  }
}
    `;
export const CurrentUserProfileDataDocument = gql`
    query CurrentUserProfileData {
  me {
    __typename
    id
    email
    ...ProfileData
  }
}
    ${ProfileDataFragmentDoc}`;
export const FetchPostDocument = gql`
    query FetchPost($id: String!) {
  post(id: $id) {
    ...FeedPost
  }
}
    ${FeedPostFragmentDoc}`;
export const FetchPostsDocument = gql`
    query FetchPosts($first: Int, $after: String, $last: Int, $before: String, $orderBy: String) {
  posts(
    first: $first
    after: $after
    last: $last
    before: $before
    orderBy: $orderBy
  ) {
    edges {
      node {
        ...FeedPost
      }
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
  }
}
    ${FeedPostFragmentDoc}`;
export const FetchProfileDataDocument = gql`
    query FetchProfileData($id: String!) {
  user(id: $id) {
    __typename
    id
    ...ProfileData
    posts(last: 18, orderBy: "createdAt") {
      edges {
        node {
          ...FeedPost
        }
      }
    }
  }
}
    ${ProfileDataFragmentDoc}
${FeedPostFragmentDoc}`;
export const FetchMyProfileDataDocument = gql`
    query FetchMyProfileData {
  me {
    __typename
    id
    email
    ...ProfileData
    posts(last: 18, orderBy: "createdAt") {
      edges {
        node {
          ...FeedPost
        }
      }
    }
  }
}
    ${ProfileDataFragmentDoc}
${FeedPostFragmentDoc}`;
export const ValidateTokenDocument = gql`
    query ValidateToken($token: String!) {
  validateToken(token: $token) {
    id
    roles
  }
}
    `;