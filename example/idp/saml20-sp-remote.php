<?php
/**
 * SAML 2.0 remote SP metadata for simpleSAMLphp.
 *
 * See: https://simplesamlphp.org/docs/stable/simplesamlphp-reference-sp-remote
 */

/*
 * Remote SP configuration. Need to recreate based on the domain
 */
 $metadata['http://sp.test.com:3000/_samlsp'] = array (
  'entityid' => 'http://sp.test.com:3000/_samlsp',
  'contacts' =>
  array (
  ),
  'metadata-set' => 'saml20-sp-remote',
  'AssertionConsumerService' =>
  array (
    0 =>
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'http://sp.test.com:3000/_samlsp/validate',
      'index' => 1,
      'isDefault' => true,
    ),
  ),
  'SingleLogoutService' =>
  array (
    0 =>
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'http://sp.test.com:3000/_samlsp/logout',
    ),
  ),
  'NameIDFormat' => 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  'keys' =>
  array (
    0 =>
    array (
      'encryption' => true,
      'signing' => true,
      'type' => 'X509Certificate',
      'X509Certificate' => 'MIIDezCCAmOgAwIBAgIJAKyDizz1lDefMA0GCSqGSIb3DQEBCwUAMFQxCzAJBgNV BAYTAlVLMQ8wDQYDVQQIDAZMb25kb24xDzANBgNVBAcMBkxvbmRvbjENMAsGA1UE CgwEVGVzdDEUMBIGA1UEAwwLc3AudGVzdC5jb20wHhcNMTUxMjI5MDg0NzUyWhcN MjUxMjI4MDg0NzUyWjBUMQswCQYDVQQGEwJVSzEPMA0GA1UECAwGTG9uZG9uMQ8w DQYDVQQHDAZMb25kb24xDTALBgNVBAoMBFRlc3QxFDASBgNVBAMMC3NwLnRlc3Qu Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsM+Aewi6YIEoKkXX npbnpDXNPxG54FCwK5YWTt8D86HkncSdtIijWO4Rncn37DHOxMKJSvJtVu2LKeXg LDf7fTrwlZZvObrOwTUrhDp+4Cw+Ge6DNJICccHPEvtdPQWdVQUQwrzEz+5TC+7j fFFk1CZaaVAH/+kBQ3e1zUU2RPOLQXfZsMnGwjxmC4g/D3HI0lxpVjyS27bHRnXP BQDPvGG7f2+gNg/EUMd60WBpc9hLNzO9Ep0IcAYF+wuiL+m0Vn+7KJaZWuf72mXy pwjjuwWzINM4PLDkv/Xv91k0VUzIX95q5S8v3l1vQFdb5vvN/lmUoTKdt2LwWBpb lYy3swIDAQABo1AwTjAdBgNVHQ4EFgQUdpYi4E+J1Y6TTN2kY7+d7ID6sg0wHwYD VR0jBBgwFoAUdpYi4E+J1Y6TTN2kY7+d7ID6sg0wDAYDVR0TBAUwAwEB/zANBgkq hkiG9w0BAQsFAAOCAQEABCxIQWT3P+wdJnyYUW47+eL91sP7/VohWByg46yZXLUJ PHJDu4qE0gxXA57+OyR3xefBJz6fPGWppHI3TckIE2IKH07yyGpBvTxa5+mbZRD9 sXVMdLwUoF/jHpTnBVOI7SVlJqlVjZX3pZ0FueezZiUlvmYI7ebZh+LDyJGwZ8Rh 3cZDILyUdz71gBv5BLTbo7uQv6IWMJO72G8xr368ANM1g3KEBdClIZTA8aaf7WU4 da/PYgPme6ayWbCKVxnhQxnHoshBLJGscbRY+0pJb30sClXQ0tNChNETEwh+5XXe x4g+P5ttj+I1tny33v4er0DLNH6CzRKQLrKZ+qDV6g==',
    ),
  ),
);
