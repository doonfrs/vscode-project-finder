import { ProjectTechnology } from './projectUtils';

/**
 * Maps project technologies to Devicon CSS classes
 */
export const technologyToDeviconClass: Record<ProjectTechnology, string> = {
    [ProjectTechnology.unknown]: 'devicon-folder-plain',
    [ProjectTechnology.javascript]: 'devicon-javascript-plain colored',
    [ProjectTechnology.typescript]: 'devicon-typescript-plain colored',
    [ProjectTechnology.react]: 'devicon-react-original colored',
    [ProjectTechnology.vue]: 'devicon-vuejs-plain colored',
    [ProjectTechnology.angular]: 'devicon-angularjs-plain colored',
    [ProjectTechnology.node]: 'devicon-nodejs-plain colored',
    [ProjectTechnology.python]: 'devicon-python-plain colored',
    [ProjectTechnology.java]: 'devicon-java-plain colored',
    [ProjectTechnology.csharp]: 'devicon-csharp-plain colored',
    [ProjectTechnology.php]: 'devicon-php-plain colored',
    [ProjectTechnology.go]: 'devicon-go-plain colored',
    [ProjectTechnology.rust]: 'devicon-rust-plain colored',
    [ProjectTechnology.ruby]: 'devicon-ruby-plain colored',
    [ProjectTechnology.flutter]: 'devicon-flutter-plain colored',
    [ProjectTechnology.swift]: 'devicon-swift-plain colored',
    [ProjectTechnology.kotlin]: 'devicon-kotlin-plain colored',
    [ProjectTechnology.cplusplus]: 'devicon-cplusplus-plain colored',
    [ProjectTechnology.c]: 'devicon-c-plain colored',
    [ProjectTechnology.docker]: 'devicon-docker-plain colored',
    [ProjectTechnology.laravel]: 'devicon-laravel-plain colored',
    [ProjectTechnology.django]: 'devicon-django-plain colored',
    [ProjectTechnology.symfony]: 'devicon-symfony-plain colored',
    [ProjectTechnology.wordpress]: 'devicon-wordpress-plain colored',
    [ProjectTechnology.yii]: 'devicon-yii-plain colored',
    [ProjectTechnology.zend]: 'devicon-zend-plain colored'
}; 