class puppetdbviewer (
  $puppetdb_version     = '2.2.2-1.el7',
  ) {

  package { 'docker':
    ensure => latest,
  }

  package { 'puppetdb':
    ensure => $puppetdb_version
  } ->
  package { 'puppetdb-terminus':
    ensure => $puppetdb_version
  }

  file { '/etc/puppet/puppet.conf':
    source => '/vagrant/vagrant/puppet/files/puppet.conf'
  }

  file { '/etc/puppet/manifests':
    ensure => directory,
  } ->
  file { '/etc/puppet/manifests/site.pp':
    source => '/vagrant/vagrant/puppet/files/site.pp'
  }

  file { '/etc/puppet/routes.yaml':
    source => '/vagrant/vagrant/puppet/files/routes.yaml'
  }

  file { '/etc/puppet/puppetdb.conf':
    source => '/vagrant/vagrant/puppet/files/puppetdb.conf'
  }

  file { '/etc/puppetdb/conf.d/jetty.ini':
    source => '/vagrant/vagrant/puppet/files/jetty.ini'
  }

  package { 'httpd':
    ensure => latest,
  } ->
  file { '/etc/httpd/conf/httpd.conf':
    source => '/vagrant/vagrant/puppet/files/httpd.conf'
  } ->
  file { '/var/www/html/puppetglasses':
    ensure => link,
    target => '/vagrant',
  }

  service { 'firewalld':
    ensure => stopped,
    enable => false,
  }

}

include puppetdbviewer
