# [CSCD71 Blockchains and Decentralized Applications](https://thierrysans.github.io/CSCD71/)

This is the source code for the CSCD71 course website.

Enjoy the course!

## Development

### 0. Fork and clone the repo
From GitHub, fork this repo to your account, then clone it to your local machine.

### 1. Install [RVM](https://rvm.io/)
```shell
$ gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
$ curl -sSL https://get.rvm.io | bash -s stable
```

You might need to source the RVM config file. Read the instructions on screen carefully.

x
### 2. Use the latest version of Ruby
```shell
$ rvm get stable
$ rvm use ruby --install --default
```

### 3. Install Bundler (dependency manager)
```
$ gem install bundler
```

### 4. Install dependencies
In the local repo directory:

```shell
$ bundle install
```

### 5. Serve the site locally
```
$ bundle exec jekyll serve
```

A local server will be started on <http://localhost:4000>.


## Contributing

### 0. Ensure your branch is up to date
To pull changes from the original repo, set up a remote to do so:

```shell
$ git remote add upstream git@github.com:ThierrySans/CSCD71.git
$ git pull upstream master
$ git push origin master
```

### 1. Make a new branch
Generally, it's a good idea to branch out your changes and then push them.

```shell
$ git checkout -b branchname
```

### 2. Make changes
You can make changes anywhere in the posts/layouts. This might be a good place to start if you're new to Jekyll: <https://jekyllrb.com/docs/>.

### 3. Push changes
The changes made should reload live on your local server. Once you're satisfied with your changes, push the new branch to your forked repo.

```shell
$ git push origin branchname
```

### 4. Create a pull request
On GitHub, you can click the "New Pull Request" button, where you can then verify your changes and submit it for review.

