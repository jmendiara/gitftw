Git for the workflows supports several styles of programming:
 * Using promises 
 * Using standard node callbacks ([async](https://github.com/caolan/async) is encouraged)
 
 
In the following examples you will see how to make the following use case:
 * Fetch the remote tags (There are two: `foo` and `bar`)
 * Delete all tags in both local an remote repository
 * Create one annotated tag
 * Push that tag
 
It's completely safe to run the examples: `git` is mocked. The executed git commands
will be shown in the console

