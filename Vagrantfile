
#; -*- mode: Ruby;-*-
Vagrant.configure(2) do |config|
  config.vm.box = "puppetlabs/centos-7.0-64-puppet"
  config.vm.network "forwarded_port", guest: 80, host: 2080, autocorrect: true
  config.vm.network "forwarded_port", guest: 8080, host: 2081, autocorrect: true
  config.vm.network "forwarded_port", guest: 8081, host: 2082, autocorrect: true

  config.vm.provision :puppet do |puppet|
    puppet.manifest_file  = 'init.pp'
    puppet.manifests_path = 'vagrant/puppet/manifests'
    puppet.module_path    = 'vagrant/puppet/modules'
  end
end
