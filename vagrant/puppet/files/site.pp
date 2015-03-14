file { '/testfile':
  ensure => 'present',
  mode   => '666',
  owner  => 'root',
  group  => 'root',
}

user { 'pinhead':
  ensure => 'present',
  uid    => '6666',
  home   => '/home/pinhead',
  managehome => true,
}

exec { 'execute true':
  command => '/bin/true',
}
